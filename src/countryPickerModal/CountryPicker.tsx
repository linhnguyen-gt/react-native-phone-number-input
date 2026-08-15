import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { FlatListProps, ImageSourcePropType, ImageStyle, ModalProps, StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { useContext } from "./CountryContext";
import CountryFilter, { type CountryFilterProps } from "./CountryFilter";
import CountryList from "./CountryList";
import CountryModal from "./CountryModal";
import { FlagButton } from "./FlagButton";
import { HeaderModal } from "./HeaderModal";
import { FlagType, type Country, type CountryCode, type Region, type Subregion } from "./types";

interface RenderFlagButtonProps extends React.ComponentProps<typeof FlagButton> {
    renderFlagButton?(props: React.ComponentProps<typeof FlagButton>): ReactNode;
}

interface RenderCountryFilterProps extends React.ComponentProps<typeof CountryFilter> {
    renderCountryFilter?(props: React.ComponentProps<typeof CountryFilter>): ReactNode;
}

/**
 * Keeps an array prop's identity stable while its contents are unchanged, so the loader effect
 * can depend on it honestly. Listing an inline `["US","VN"]` literal directly would refire the
 * effect on every parent render; omitting it — which is what the old `eslint-disable` did —
 * meant changing `excludeCountries` after mount had no effect at all.
 */
const useStableList = <T,>(list: T[] | undefined): T[] | undefined => {
    const ref = useRef(list);
    const previous = ref.current;
    const unchanged =
        previous === list ||
        (!!previous && !!list && previous.length === list.length && previous.every((v, i) => v === list[i]));
    if (!unchanged) {
        ref.current = list;
    }
    return ref.current;
};

const renderFlagButton = (props: RenderFlagButtonProps): ReactNode =>
    props.renderFlagButton ? props.renderFlagButton(props) : <FlagButton {...props} />;

const renderFilter = (props: RenderCountryFilterProps): ReactNode =>
    props.renderCountryFilter ? props.renderCountryFilter(props) : <CountryFilter {...props} />;

export type CountryPickerProps = {
    allowFontScaling?: boolean;
    countryCode?: CountryCode;
    region?: Region;
    subregion?: Subregion;
    countryCodes?: CountryCode[];
    excludeCountries?: CountryCode[];
    preferredCountries?: CountryCode[];
    modalSafeAreaEdges?: Edge[];
    modalProps?: ModalProps;
    filterProps?: CountryFilterProps;
    flatListProps?: FlatListProps<Country>;
    withEmoji?: boolean;
    withCountryNameButton?: boolean;
    withCurrencyButton?: boolean;
    withCallingCodeButton?: boolean;
    withFlagButton?: boolean;
    withCloseButton?: boolean;
    withFilter?: boolean;
    withAlphaFilter?: boolean;
    withCallingCode?: boolean;
    withCurrency?: boolean;
    withFlag?: boolean;
    withModal?: boolean;
    disableNativeModal?: boolean;
    visible?: boolean;
    placeholder?: string;
    containerButtonStyle?: StyleProp<ViewStyle>;
    closeButtonImage?: ImageSourcePropType;
    closeButtonStyle?: StyleProp<ViewStyle>;
    closeButtonImageStyle?: StyleProp<ImageStyle>;
    renderFlagButton?(props: React.ComponentProps<typeof FlagButton>): ReactNode;
    renderCountryFilter?(props: React.ComponentProps<typeof CountryFilter>): ReactNode;
    onSelect?(country: Country): void;
    onOpen?(): void;
    onClose?(): void;
    /**
     * Called when the country list fails to load. Defaults to `console.warn`, which is what
     * this component did before the callback existed. In FLAT flag mode the list comes from a
     * third-party host, so a failure here is a network condition a consumer may want to show.
     */
    onError?(error: unknown): void;
};

const CountryPicker = ({
    allowFontScaling = true,
    countryCode,
    region,
    subregion,
    countryCodes,
    renderFlagButton: renderButton,
    renderCountryFilter,
    filterProps,
    modalSafeAreaEdges,
    modalProps,
    flatListProps,
    onSelect,
    withEmoji,
    withFilter,
    withCloseButton,
    withCountryNameButton,
    withCallingCodeButton,
    withCurrencyButton,
    containerButtonStyle,
    withAlphaFilter = false,
    withCallingCode = false,
    withCurrency,
    withFlag,
    withModal = true,
    disableNativeModal,
    withFlagButton,
    onClose: handleClose,
    onOpen: handleOpen,
    closeButtonImage,
    closeButtonStyle,
    closeButtonImageStyle,
    excludeCountries,
    placeholder = "Select Country",
    preferredCountries,
    onError,
    ...props
}: CountryPickerProps) => {
    // Four independent concerns. They changed for unrelated reasons and were never written
    // together, so holding them in one object only ever created chances to overwrite one with
    // a stale copy of the others.
    const [visible, setVisible] = useState<boolean>(props.visible || false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [filterFocus, setFilterFocus] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<unknown>(undefined);
    const [attempt, setAttempt] = useState<number>(0);

    // Consumer callbacks are held in refs. They are inline arrows in practice, so depending on
    // them directly restarts the loader effect and — via `onSelectClose`, which reaches every
    // country row — re-renders the whole list on each parent render.
    const onErrorRef = useRef(onError);
    const handlersRef = useRef({ onSelect, onOpen: handleOpen, onClose: handleClose });
    useEffect(() => {
        onErrorRef.current = onError;
        handlersRef.current = { onSelect, onOpen: handleOpen, onClose: handleClose };
    }, [onError, onSelect, handleOpen, handleClose]);

    const { translation, getCountriesAsync } = useContext();

    useEffect(() => {
        setVisible(props.visible || false);
    }, [props.visible]);

    const onOpen = useCallback(() => {
        setVisible(true);
        handlersRef.current.onOpen?.();
    }, []);
    const onClose = useCallback(() => {
        setFilter("");
        setVisible(false);
        handlersRef.current.onClose?.();
    }, []);

    const onSelectClose = useCallback(
        (country: Country) => {
            handlersRef.current.onSelect?.(country);
            onClose();
        },
        [onClose]
    );
    const onFocus = useCallback(() => setFilterFocus(true), []);
    const onBlur = useCallback(() => setFilterFocus(false), []);
    const flagProp = {
        allowFontScaling,
        countryCode,
        withEmoji,
        withCountryNameButton,
        withCallingCodeButton,
        withCurrencyButton,
        withFlagButton,
        renderFlagButton: renderButton,
        onOpen,
        containerButtonStyle,
        placeholder: placeholder || "Select Country"
    };

    // Opening an empty picker is the user telling us to try again. Without this, a load that
    // failed at mount can only be retried by unmounting the screen: the loader is an effect
    // keyed on props that do not change when the modal reopens.
    const wasVisible = useRef(false);
    useEffect(() => {
        const justOpened = visible && !wasVisible.current;
        wasVisible.current = visible;
        if (justOpened && countries.length === 0) {
            setAttempt((previous) => previous + 1);
        }
    }, [visible, countries.length]);

    const stableCountryCodes = useStableList(countryCodes);
    const stableExcludeCountries = useStableList(excludeCountries);
    const stablePreferredCountries = useStableList(preferredCountries);

    useEffect(() => {
        let cancel = false;
        getCountriesAsync(
            withEmoji ? FlagType.EMOJI : FlagType.FLAT,
            translation,
            region,
            subregion,
            stableCountryCodes,
            stableExcludeCountries,
            stablePreferredCountries,
            withAlphaFilter
        )
            .then((loaded) => {
                if (cancel) return;
                setCountries(loaded);
                setLoadError(undefined);
            })
            .catch((error) => {
                if (cancel) return;
                setLoadError(error);
                (onErrorRef.current ?? console.warn)(error);
            });

        return () => {
            cancel = true;
        };
    }, [
        getCountriesAsync,
        translation,
        withEmoji,
        region,
        subregion,
        stableCountryCodes,
        stableExcludeCountries,
        stablePreferredCountries,
        withAlphaFilter,
        attempt
    ]);

    return (
        <>
            {withModal && renderFlagButton(flagProp)}
            <CountryModal
                {...{ visible, withModal, modalSafeAreaEdges, disableNativeModal, ...modalProps }}
                onRequestClose={onClose}
                onDismiss={onClose}>
                <HeaderModal
                    {...{
                        withFilter,
                        onClose,
                        closeButtonImage,
                        closeButtonImageStyle,
                        closeButtonStyle,
                        withCloseButton
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    renderFilter={(props) =>
                        renderFilter({
                            ...props,
                            allowFontScaling,
                            renderCountryFilter,
                            onChangeText: setFilter,
                            value: filter,
                            onFocus,
                            onBlur,
                            ...filterProps
                        })
                    }
                />
                <CountryList
                    {...{
                        onSelect: onSelectClose,
                        data: countries,
                        loadError,
                        withAlphaFilter: withAlphaFilter && filter === "",
                        withCallingCode,
                        withCurrency,
                        withFlag,
                        withEmoji,
                        filter,
                        filterFocus,
                        flatListProps
                    }}
                />
            </CountryModal>
        </>
    );
};

export default CountryPicker;
