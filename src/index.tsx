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
    type TextInputSelectionChangeEvent,
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
import { applyMask, capToMask, getCaretAfterEdit, getMaskForCountry, toE164 } from "./maskUtils";
import styles from "./styles";
import { useResponsiveWidths } from "./useResponsiveWidths";

/**
 * The type surface the hand-written `index.d.ts` used to publish. Declarations are generated
 * from this file now, so anything a consumer is allowed to name has to be re-exported here —
 * a silently narrower public surface is a breaking change nobody notices until it breaks them.
 */
export type {
    CallingCode,
    Country,
    CountryCode,
    CountryFilterProps,
    CountryPickerModalProps,
    Region,
    Subregion
} from "./countryPickerModal";

const dropDown =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";
const phoneUtil = PhoneNumberUtil.getInstance();

export type PhoneInputProps = {
    /** Enable dark theme styling. */
    withDarkTheme?: boolean;

    /** Add a shadow to the input container. */
    withShadow?: boolean;

    /**
     * Format the number as it is typed, using a country-specific pattern
     * (US: `(123) 456-7890`, VN: `012 345 6789`).
     *
     * The field displays the formatted string; `onChangeText` still receives digits only, and
     * `onChangeFormattedText` receives E.164. Where a pattern was hand-authored for the country,
     * input stops once it is full.
     *
     * @default false
     * @example
     * <PhoneInput withMask defaultCode="US" onChangeText={(text) => console.log(text)} />
     * // typed:                    1234567890
     * // displayed:                (123) 456-7890
     * // onChangeText:             "1234567890"
     * // onChangeFormattedText:    "+11234567890"
     */
    withMask?: boolean;

    /** Focus the input when the component mounts. */
    autoFocus?: boolean;

    /**
     * Country to start on, as an ISO 3166-1 alpha-2 code. Overridden by `defaultCallingCode`.
     *
     * @example
     * defaultCode="US"
     */
    defaultCode?: CountryCode;

    /**
     * Calling code to start on, without the `+`. Takes precedence over `defaultCode`.
     *
     * @example
     * // Singapore is selected, `defaultCode` is ignored.
     * <PhoneInput defaultCode="US" defaultCallingCode="65" />
     */
    defaultCallingCode?: string;

    /**
     * Controlled value. Supplying it at mount makes the component controlled for its whole life:
     * the parent owns the value and must update it from `onChangeText`.
     *
     * Under `withMask` this is the raw national number — the same string `onChangeText` emits —
     * and the mask is applied on the way to the screen.
     */
    value?: string;

    /**
     * Initial value for an uncontrolled input. Read once, at mount; later changes are ignored.
     * Pass `value` instead to drive the field from the parent.
     */
    defaultValue?: string;

    /** Make the input read-only. */
    disabled?: boolean;

    /** Hide the dropdown arrow. */
    disableArrowIcon?: boolean;

    /** Placeholder for the input. */
    placeholder?: string;

    /** Called with the whole country record when the selection changes. */
    onChangeCountry?: (country: Country) => void;

    /** Called with the national number. Digits only when `withMask` is on. */
    onChangeText?: (text: string) => void;

    /**
     * Called with the number in E.164 (`+11234567890`), masked or not.
     *
     * While the number is still half-typed and cannot be parsed, this falls back to
     * `+<callingCode><digits>` so the callback stays useful on every keystroke. Formatting is
     * not validation — use `isValidNumber` for that.
     */
    onChangeFormattedText?: (text: string) => void;

    /** Called when the input loses focus. */
    onBlur?: () => void;

    /** Called when the input gains focus. */
    onFocus?: () => void;

    /** Replaces the built-in dropdown arrow. */
    renderDropdownImage?: React.ReactNode;

    /** Style for the outer container. */
    containerStyle?: StyleProp<ViewStyle>;

    /** Style for the container around the text input. */
    textContainerStyle?: StyleProp<ViewStyle>;

    /** Extra props forwarded to the underlying `TextInput`. */
    textInputProps?: TextInputProps;

    /** Style for the text input. */
    textInputStyle?: StyleProp<TextStyle>;

    /** Style for the calling-code text. */
    codeTextStyle?: StyleProp<TextStyle>;

    /** Style for the flag button. */
    flagButtonStyle?: StyleProp<ViewStyle>;

    /** Style for the country picker button. */
    countryPickerButtonStyle?: StyleProp<ViewStyle>;

    /**
     * Order of the two halves of the control.
     *
     * `"first"` puts the flag button before the input, `"second"` after it.
     */
    layout?: "first" | "second";

    /** Props for the country picker's search field. */
    filterProps?: CountryFilterProps;

    /**
     * Overrides forwarded to the country picker. `Partial` because `PhoneInput` supplies
     * `countryCode` and `onSelect` itself — requiring them here made the prop unusable.
     */
    countryPickerProps?: Partial<CountryPickerModalProps>;

    /** Font size of the flag emoji, or height of the flag image. */
    flagSize?: number;

    /** Show the calling code next to the flag. */
    showCountryCode?: boolean;
};

export type PhoneInputRefType = {
    /**
     * The selected country, as an ISO 3166-1 alpha-2 code.
     *
     * @example
     * phoneInputRef.current?.getCountryCode(); // "US"
     */
    getCountryCode: () => CountryCode;

    /**
     * The selected country's calling code, without the `+`.
     *
     * @example
     * phoneInputRef.current?.getCallingCode(); // "1" for US, "84" for VN
     */
    getCallingCode: () => CallingCode | undefined;

    /**
     * Whether the number is valid for the selected country, according to libphonenumber.
     *
     * This answers "could this number exist", not "does this number belong to this user" — do
     * not use it as an authorization decision.
     *
     * @example
     * phoneInputRef.current?.isValidNumber("2025550123"); // true
     */
    isValidNumber: (number: string) => boolean;

    /**
     * The current number, with a leading zero stripped from `number` and the E.164 form in
     * `formattedNumber` — the identical string `onChangeFormattedText` emits for the same input.
     *
     * @example
     * phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero();
     * // { number: "2025550123", formattedNumber: "+12025550123" }
     */
    getNumberAfterPossiblyEliminatingZero: () => {
        number: string | undefined;
        formattedNumber: string | undefined;
    };
};

/** Hoisted so the default is one shared object rather than a new one per render. */
const EMPTY_FILTER_PROPS: CountryFilterProps = {};

/**
 * `ref` is a plain prop, which React 19 supports directly — hence the `react: ">=19"` peer.
 * The type is spelled out rather than taken from `PhoneInputProps` so consumers still see it
 * on the component, exactly as `forwardRef` used to advertise it.
 */
const PhoneInput = ({ ref, ...props }: PhoneInputProps & { ref?: React.Ref<PhoneInputRefType> }) => {
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

    /**
     * Caret control, masked mode only, and deliberately one-shot.
     *
     * Re-masking replaces the whole string, which sends the caret to the end. `pendingSelection`
     * puts it back exactly once, for the single commit that follows a text change, and the effect
     * below hands control straight back to the platform. A permanently controlled `selection` on
     * Android fights predictive text — this stays out of the way except for the one commit where
     * the value was rewritten underneath the user.
     */
    const [pendingSelection, setPendingSelection] = React.useState<{ start: number; end: number } | undefined>(
        undefined
    );

    /**
     * Released after the commit that carried it, not from `onSelectionChange`.
     *
     * iOS fires `onSelectionChange` for a keystroke in the same batch as `onChangeText`, so
     * clearing from there collapsed set-then-clear into a single render and the correction never
     * reached the platform: the caret stayed where it was and consecutive digits went in
     * backwards. Clearing from an effect guarantees one committed render with the caret set.
     */
    const pendingSelectionRef = React.useRef<number | undefined>(undefined);
    React.useEffect(() => {
        if (pendingSelection) {
            pendingSelectionRef.current = undefined;
            setPendingSelection(undefined);
        }
    }, [pendingSelection]);
    /**
     * The whole selection, not just its start.
     *
     * An edit replaces the selected range, so the number of characters the user actually added is
     * the net length change *plus* whatever was selected. Tracking only the start made every range
     * edit land the caret in the wrong place, and select-all-then-retype put it before the opening
     * literal, which reversed the digits that followed.
     */
    const lastSelection = React.useRef({ start: 0, end: 0 });
    const lastDisplayLength = React.useRef(0);

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
        // `__DEV__` is injected by Metro and by nothing else. The published `lib/module` build is
        // what react-native-web bundlers and any SSR render load, and referencing a global they
        // never define throws on first render — so the guard has to be a `typeof` check.
        if (typeof __DEV__ !== "undefined" && __DEV__ && isControlled !== (props.value !== undefined)) {
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
    const rawSource = isControlled ? (props.value ?? "") : internalValue;

    /**
     * Capped here rather than only in `onChangeText`, which is the one path that used to enforce
     * it. A seeded `defaultValue`, a controlled `value`, and switching to a country with a shorter
     * mask all deposit digits without passing through a keystroke, and the field used to display
     * the overflow — and hand it back from the ref — until the next keystroke silently dropped it.
     */
    const rawValue = withMask ? capToMask(rawSource, countryCode) : rawSource;

    const displayValue = React.useMemo(
        () => (withMask ? applyMask(rawValue, getMaskForCountry(countryCode)) : rawValue),
        [withMask, rawValue, countryCode]
    );

    // Deliberately runs on every commit rather than on a dependency change. `onChangeText` writes
    // its *predicted* display length so a keystroke arriving before the commit reads something
    // current; a controlled parent that normalises or rejects the value never renders that
    // prediction, and only an unconditional sync puts the refs back on what is actually on screen.
    React.useEffect(() => {
        rawValueRef.current = rawValue;
        lastDisplayLength.current = displayValue.length;
    });

    React.useEffect(() => {
        const setupDefaultCallingCode = async () => {
            if (props.defaultCallingCode) {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const countryCode = await getCountryCodeByCallingCode(props.defaultCallingCode);
                setCountryCode(countryCode);
                setCode(props.defaultCallingCode);
            }
        };

        // A country list that fails to load leaves the calling code at its default. That is a
        // degraded label, not a crash, and letting the rejection escape only adds a redbox.
        setupDefaultCallingCode().catch(() => {});
    }, [props.defaultCallingCode, getCountryCodeByCallingCode]);

    React.useEffect(() => {
        const loadDefaultCode = async () => {
            // `defaultCallingCode` is documented to win, and it cannot win by racing: its lookup
            // resolves a microtask sooner than this one, so whichever `setCode` runs last decides.
            // Standing down here is what actually implements the documented precedence.
            if (props.defaultCode && !props.defaultCallingCode) {
                const callingCode = await getCallingCode(props.defaultCode);
                setCode(callingCode);
            }
        };
        loadDefaultCode().catch(() => {});
    }, [props.defaultCode, props.defaultCallingCode]);

    const onSelect = React.useCallback(
        (country: Country) => {
            setCountryCode(country.cca2);
            setCode(country.callingCode[0]);

            // The masked display is derived from rawValue and countryCode, so changing the
            // country re-masks on the next render. Nothing to re-apply by hand — except the cap,
            // because the new country's mask may be shorter than what is already entered. The
            // parent is told about that truncation rather than discovering it later.
            const next = withMask ? capToMask(rawValueRef.current, country.cca2) : rawValueRef.current;
            if (next !== rawValueRef.current) {
                rawValueRef.current = next;
                if (!isControlled) {
                    setInternalValue(next);
                }
                callbacks.current.onChangeText?.(next);
            }

            if (withMask) {
                // The new mask rewrites the whole string, so a caret offset measured against the
                // old one is meaningless. Anchor both refs to the end of what will be rendered.
                const nextDisplay = applyMask(next, getMaskForCountry(country.cca2));
                lastSelection.current = { start: nextDisplay.length, end: nextDisplay.length };
                lastDisplayLength.current = nextDisplay.length;
            }

            callbacks.current.onChangeFormattedText?.(toE164(next, country.cca2, country.callingCode[0]));
            callbacks.current.onChangeCountry?.(country);
        },
        [withMask, isControlled]
    );

    const onChangeText = React.useCallback(
        (text: string) => {
            // Under a mask the user types into the formatted string; only the digits are real, and
            // only as many of them as the country's mask can hold.
            const nextValue = withMask ? capToMask(text, countryCode) : text;

            if (withMask) {
                const nextDisplay = applyMask(nextValue, getMaskForCountry(countryCode));
                const caret = getCaretAfterEdit(lastDisplayLength.current, lastSelection.current, text, nextDisplay);
                // Recorded here rather than left to the effect below. A fast typist — or a test
                // driver — can deliver the next keystroke before React has committed, and reading
                // a stale caret or display length there scrambles the digit order.
                lastSelection.current = { start: caret, end: caret };
                lastDisplayLength.current = nextDisplay.length;
                pendingSelectionRef.current = caret;
                setPendingSelection({ start: caret, end: caret });
            }

            if (!isControlled) {
                setInternalValue(nextValue);
            }

            callbacks.current.onChangeText?.(nextValue);
            callbacks.current.onChangeFormattedText?.(toE164(nextValue, countryCode, code));
        },
        [code, countryCode, withMask, isControlled]
    );

    const onSelectionChange = React.useCallback((event: TextInputSelectionChangeEvent) => {
        const { start, end } = event.nativeEvent.selection;

        // Between a text change and the commit that carries the corrected caret, the platform
        // reports where *it* put the caret after replacing the string — usually the end. Taking
        // that as the user's position undoes the correction on the following keystroke, so while
        // a correction is outstanding only its own echo is believed.
        if (pendingSelectionRef.current !== undefined && pendingSelectionRef.current !== start) {
            return;
        }

        // Releasing the controlled selection is the effect's job, not this handler's — doing it
        // here loses the correction on iOS, see `pendingSelection`.
        lastSelection.current = { start, end };
    }, []);

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
                const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
                if (!cleanNumber) {
                    return false;
                }
                // The leading zero is not stripped by hand here, for the same regional reason
                // `toE164` documents: `parse` applies the region's trunk-prefix rule itself.
                // Stripping first made this call disagree with `onChangeFormattedText` about the
                // very same string — `0612345678` is a valid Italian number and was reported
                // invalid, while the formatted output correctly read `+390612345678`.
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
                // Built from `rawValue`, not from the hand-stripped `currentNumber`, so this
                // is the identical string `onChangeFormattedText` emitted for the same input.
                formattedNumber: toE164(rawValue, countryCode, code)
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
    //
    // The theme is merged rather than replaced: supplying any `countryPickerProps` at all used to
    // drop the default, so `withDarkTheme` silently stopped applying to the picker. An explicit
    // `theme` inside `countryPickerProps` still wins.
    const countryPickerProps = React.useMemo(
        () => ({ theme: withDarkTheme ? DARK_THEME : DEFAULT_THEME, ...props.countryPickerProps }),
        [props.countryPickerProps, withDarkTheme]
    );

    const widths = useResponsiveWidths();

    return (
        <CountryModalProvider>
            <View style={[styles.container, widths.container, withShadow && styles.shadow, containerStyle]}>
                <TouchableOpacity
                    testID="phone-input-country-button"
                    style={[
                        styles.flagButtonView,
                        layout === "second" ? widths.flagButtonExtra : widths.flagButton,
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
                        selection={withMask ? pendingSelection : undefined}
                        onSelectionChange={withMask ? onSelectionChange : undefined}
                        editable={!disabled}
                        selectionColor={(withDarkTheme ? DARK_THEME : DEFAULT_THEME).onBackgroundTextColor}
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
};

export default PhoneInput;
