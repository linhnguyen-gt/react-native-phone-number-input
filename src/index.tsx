import { PhoneNumberUtil } from "google-libphonenumber";
import React from "react";
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type StyleProp,
    type TextInputProps,
    type TextStyle,
    type ViewStyle
} from "react-native";

import CountryPicker, {
    CountryModalProvider,
    DARK_THEME,
    DEFAULT_THEME,
    Flag,
    getCallingCode,
    loadDataAsync,
    type CallingCode,
    type Country,
    type CountryCode,
    type CountryFilterProps,
    type CountryPickerModalProps
} from "./countryPickerModal";
import { applyMask, getMaskForCountry, removeMask } from "./maskUtils";
import styles from "./styles";

const dropDown =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";
const phoneUtil = PhoneNumberUtil.getInstance();

export type PhoneInputProps = {
    withDarkTheme?: boolean;
    withShadow?: boolean;
    withMask?: boolean;
    autoFocus?: boolean;
    defaultCode?: CountryCode;
    defaultCallingCode?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    disableArrowIcon?: boolean;
    placeholder?: string;
    onChangeCountry?: (country: Country) => void;
    onChangeText?: (text: string) => void;
    onChangeFormattedText?: (text: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    renderDropdownImage?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    textInputProps?: TextInputProps;
    textInputStyle?: StyleProp<TextStyle>;
    codeTextStyle?: StyleProp<TextStyle>;
    flagButtonStyle?: StyleProp<ViewStyle>;
    countryPickerButtonStyle?: StyleProp<ViewStyle>;
    layout?: "first" | "second";
    filterProps?: CountryFilterProps;
    /**
     * Overrides forwarded to the country picker. `Partial` because `PhoneInput` supplies
     * `countryCode` and `onSelect` itself — requiring them here made the prop unusable.
     */
    countryPickerProps?: Partial<CountryPickerModalProps>;
    flagSize?: number;
    showCountryCode?: boolean;
};

export type PhoneInputRefType = {
    getCountryCode: () => CountryCode;
    getCallingCode: () => CallingCode | undefined;
    isValidNumber: (number: string) => boolean;
    getNumberAfterPossiblyEliminatingZero: () => {
        number: string | undefined;
        formattedNumber: string | undefined;
    };
};

/** Hoisted so the default is one shared object rather than a new one per render. */
const EMPTY_FILTER_PROPS: CountryFilterProps = {};

/**
 * Join a calling code onto a number without ever producing a string containing "undefined".
 * An empty number yields an empty string rather than a bare "+84", so a consumer can tell
 * "nothing entered" from "entered, and here is the country".
 */
const withCallingCode = (rawValue: string, callingCode: string | undefined): string =>
    rawValue.length > 0 && callingCode ? `+${callingCode}${rawValue}` : rawValue;

const PhoneInput = React.forwardRef<PhoneInputRefType, PhoneInputProps>((props, ref) => {
    const getCountryCodeByCallingCode = React.useCallback(async (callingCode: string) => {
        const countries = await loadDataAsync();
        if (!countries) return "US";

        const countryEntry = Object.entries(countries).find(([_, country]) => country.callingCode[0] === callingCode);

        return countryEntry ? (countryEntry[0] as CountryCode) : "US";
    }, []);

    const [code, setCode] = React.useState<string | undefined>(
        props.defaultCallingCode || (props.defaultCode ? undefined : "91")
    );
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [countryCode, setCountryCode] = React.useState<CountryCode>(props.defaultCode || "IN");

    const { withMask = false, disabled = false, layout = "first", flagSize } = props;

    /**
     * Consumer callbacks are held in a ref. They are almost always inline arrows, so listing
     * them in a `useCallback` dependency array rebuilds the callback on every render — which
     * is what made the memoization here decorative, and what re-rendered the whole picker
     * subtree on every keystroke.
     */
    const callbacks = React.useRef({
        onChangeText: props.onChangeText,
        onChangeFormattedText: props.onChangeFormattedText,
        onChangeCountry: props.onChangeCountry
    });
    React.useEffect(() => {
        callbacks.current = {
            onChangeText: props.onChangeText,
            onChangeFormattedText: props.onChangeFormattedText,
            onChangeCountry: props.onChangeCountry
        };
    }, [props.onChangeText, props.onChangeFormattedText, props.onChangeCountry]);

    /**
     * `onSelect` is handed down to every country row. Closing over `rawValue` directly would
     * change its identity on every keystroke and re-render all ~250 of them, so the current
     * value is read from a ref at call time instead. Selection is a user gesture, which always
     * happens after the commit that updated this.
     */
    const rawValueRef = React.useRef("");

    /**
     * Controlled-ness is decided once, at mount, and never re-read. A component that switches
     * modes mid-life is a consumer bug; coping with it silently is how the previous version
     * ended up unable to tell an empty field from an unset one.
     *
     * `defaultValue` seeds internal state here and is deliberately not a dependency of anything
     * afterwards — it is a seed, not a binding.
     */
    const isControlled = React.useRef(props.value !== undefined).current;
    const [internalValue, setInternalValue] = React.useState<string>(() =>
        isControlled ? "" : (props.defaultValue ?? "")
    );

    React.useEffect(() => {
        if (__DEV__ && isControlled !== (props.value !== undefined)) {
            console.warn(
                "PhoneInput: switching between controlled and uncontrolled is not supported. " +
                    `The component mounted ${isControlled ? "controlled" : "uncontrolled"} and stays that way. ` +
                    'If a form library supplies `undefined` on the first render, pass "" instead.'
            );
        }
    }, [isControlled, props.value]);

    /**
     * The single source of truth for what the user has entered.
     *
     * Under `withMask` the parent stores raw digits — that is what `onChangeText` emits — and
     * the mask is applied on the way to the screen. Without masking the value passes through
     * verbatim, as it always has.
     */
    const rawValue = isControlled ? (withMask ? removeMask(props.value ?? "") : (props.value ?? "")) : internalValue;

    const displayValue = React.useMemo(
        () => (withMask ? applyMask(rawValue, getMaskForCountry(countryCode)) : rawValue),
        [withMask, rawValue, countryCode]
    );

    React.useEffect(() => {
        rawValueRef.current = rawValue;
    }, [rawValue]);

    React.useEffect(() => {
        const setupDefaultCallingCode = async () => {
            if (props.defaultCallingCode) {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const countryCode = await getCountryCodeByCallingCode(props.defaultCallingCode);
                setCountryCode(countryCode);
                setCode(props.defaultCallingCode);
            }
        };

        setupDefaultCallingCode();
    }, [props.defaultCallingCode, getCountryCodeByCallingCode]);

    React.useEffect(() => {
        const loadDefaultCode = async () => {
            if (props.defaultCode) {
                const callingCode = await getCallingCode(props.defaultCode);
                setCode(callingCode);
            }
        };
        loadDefaultCode();
    }, [props.defaultCode]);

    const onSelect = React.useCallback((country: Country) => {
        setCountryCode(country.cca2);
        setCode(country.callingCode[0]);

        // The masked display is derived from rawValue and countryCode, so changing the
        // country re-masks on the next render. Nothing to re-apply by hand.
        callbacks.current.onChangeFormattedText?.(withCallingCode(rawValueRef.current, country.callingCode[0]));
        callbacks.current.onChangeCountry?.(country);
    }, []);

    const onChangeText = React.useCallback(
        (text: string) => {
            // Under a mask the user types into the formatted string; only the digits are real.
            const nextValue = withMask ? removeMask(text) : text;

            if (!isControlled) {
                setInternalValue(nextValue);
            }

            callbacks.current.onChangeText?.(nextValue);
            callbacks.current.onChangeFormattedText?.(withCallingCode(nextValue, code));
        },
        [code, withMask, isControlled]
    );

    const renderDefaultDropdownImage = React.useMemo(() => {
        return <Image source={{ uri: dropDown }} resizeMode="contain" style={styles.dropDownImage} />;
    }, []);

    const renderFlagButton = React.useCallback(() => {
        if (layout === "first") {
            return <Flag countryCode={countryCode} flagSize={flagSize || DEFAULT_THEME.flagSize} />;
        }
        return null;
    }, [countryCode, layout, flagSize]);

    React.useImperativeHandle(ref, () => ({
        getCountryCode: () => countryCode,
        getCallingCode: () => code,
        isValidNumber: (phoneNumber: string) => {
            if (!phoneNumber || !countryCode) {
                return false;
            }
            try {
                let cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
                if (cleanNumber.startsWith("0")) {
                    cleanNumber = cleanNumber.substring(1);
                }
                if (!cleanNumber) {
                    return false;
                }
                const parsedNumber = phoneUtil.parse(cleanNumber, countryCode);
                return phoneUtil.isValidNumber(parsedNumber);
            } catch {
                // There used to be a fallback here that re-parsed with `code` — a calling code
                // where libphonenumber wants a region code. It threw for every input without a
                // `+` prefix and was unreachable for inputs with one.
                return false;
            }
        },
        getNumberAfterPossiblyEliminatingZero: () => {
            const currentNumber = rawValue.startsWith("0") ? rawValue.slice(1) : rawValue;
            return {
                number: currentNumber,
                formattedNumber: withCallingCode(currentNumber, code)
            };
        }
    }));

    const {
        withShadow,
        withDarkTheme,
        codeTextStyle,
        textInputProps,
        textInputStyle,
        autoFocus,
        placeholder,
        disableArrowIcon,
        flagButtonStyle,
        containerStyle,
        textContainerStyle,
        renderDropdownImage = renderDefaultDropdownImage,
        filterProps = EMPTY_FILTER_PROPS,
        countryPickerButtonStyle,
        onBlur,
        onFocus,
        showCountryCode = true
    } = props;

    // A fresh literal here changed `CountryPicker`'s props on every render, which is what put
    // the whole picker subtree back through render on every keystroke.
    const countryPickerProps = React.useMemo(
        () => props.countryPickerProps ?? { theme: withDarkTheme ? DARK_THEME : DEFAULT_THEME },
        [props.countryPickerProps, withDarkTheme]
    );

    return (
        <CountryModalProvider>
            <View style={[styles.container, withShadow && styles.shadow, containerStyle]}>
                <TouchableOpacity
                    testID="phone-input-country-button"
                    style={[
                        styles.flagButtonView,
                        layout === "second" && styles.flagButtonExtraWidth,
                        flagButtonStyle,
                        countryPickerButtonStyle
                    ]}
                    disabled={disabled}
                    onPress={() => setModalVisible(true)}>
                    <CountryPicker
                        onSelect={onSelect}
                        withEmoji
                        withFilter
                        withFlag
                        filterProps={filterProps}
                        countryCode={countryCode}
                        withCallingCode
                        visible={modalVisible}
                        renderFlagButton={renderFlagButton}
                        onClose={() => setModalVisible(false)}
                        {...countryPickerProps}
                    />
                    {showCountryCode && code && layout === "second" && (
                        <Text testID="phone-input-calling-code" style={[styles.codeText, codeTextStyle]}>
                            {`+${code}`}
                        </Text>
                    )}
                    {!disableArrowIcon && <React.Fragment>{renderDropdownImage}</React.Fragment>}
                </TouchableOpacity>
                <View style={[styles.textContainer, textContainerStyle]}>
                    {showCountryCode && code && layout === "first" && (
                        <Text testID="phone-input-calling-code" style={[styles.codeText, codeTextStyle]}>
                            {`+${code}`}
                        </Text>
                    )}
                    <TextInput
                        testID="phone-input-text"
                        style={[styles.numberText, textInputStyle]}
                        placeholder={placeholder}
                        onChangeText={onChangeText}
                        value={displayValue}
                        editable={!disabled}
                        selectionColor="black"
                        keyboardAppearance={withDarkTheme ? "dark" : "default"}
                        keyboardType="number-pad"
                        autoFocus={autoFocus}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        {...textInputProps}
                    />
                </View>
            </View>
        </CountryModalProvider>
    );
});

export default PhoneInput;
