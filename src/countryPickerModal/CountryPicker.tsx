import React, { useEffect, useState, type ReactNode } from "react";
import type { FlatListProps, ImageSourcePropType, ImageStyle, ModalProps, StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { useContext } from "./CountryContext";
import CountryFilter, { type CountryFilterProps } from "./CountryFilter";
import CountryList from "./CountryList";
import CountryModal from "./CountryModal";
import { FlagButton } from "./FlagButton";
import { HeaderModal } from "./HeaderModal";
import { FlagType, type Country, type CountryCode, type Region, type Subregion } from "./types";

interface State {
    visible: boolean;
    countries: Country[];
    filter?: string;
    filterFocus?: boolean;
}

interface RenderFlagButtonProps extends React.ComponentProps<typeof FlagButton> {
    renderFlagButton?(props: React.ComponentProps<typeof FlagButton>): ReactNode;
}

interface RenderCountryFilterProps extends React.ComponentProps<typeof CountryFilter> {
    renderCountryFilter?(props: React.ComponentProps<typeof CountryFilter>): ReactNode;
}

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
};

const CountryPicker: React.FC<CountryPickerProps> = ({
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
    ...props
}) => {
    const [state, setState] = useState<State>({
        visible: props.visible || false,
        countries: [],
        filter: "",
        filterFocus: false
    });
    const { translation, getCountriesAsync } = useContext();
    const { visible, filter, countries, filterFocus } = state;

    useEffect(() => {
        setState((previous) =>
            previous.visible === (props.visible || false) ? previous : { ...previous, visible: props.visible || false }
        );
    }, [props.visible]);

    const onOpen = () => {
        setState((previous) => ({ ...previous, visible: true }));
        if (handleOpen) {
            handleOpen();
        }
    };
    const onClose = () => {
        setState((previous) => ({ ...previous, filter: "", visible: false }));
        if (handleClose) {
            handleClose();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const setFilter = (filter: string) => setState((previous) => ({ ...previous, filter }));
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const setCountries = (countries: Country[]) => setState((previous) => ({ ...previous, countries }));
    const onSelectClose = (country: Country) => {
        onSelect?.(country);
        onClose();
    };
    const onFocus = () => setState((previous) => ({ ...previous, filterFocus: true }));
    const onBlur = () => setState((previous) => ({ ...previous, filterFocus: false }));
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

    useEffect(() => {
        let cancel = false;
        getCountriesAsync(
            withEmoji ? FlagType.EMOJI : FlagType.FLAT,
            translation,
            region,
            subregion,
            countryCodes,
            excludeCountries,
            preferredCountries,
            withAlphaFilter
        )
            // eslint-disable-next-line @typescript-eslint/no-shadow
            .then((countries) => (cancel ? null : setCountries(countries)))
            .catch(console.warn);

        return () => {
            cancel = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translation, withEmoji]);

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
                        letters: [],
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
