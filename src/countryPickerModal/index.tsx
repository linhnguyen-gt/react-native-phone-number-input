import type { ReactNode } from "react";
import type { FlatListProps, ModalProps, StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { CountryProvider, DEFAULT_COUNTRY_CONTEXT } from "./CountryContext";
import type { CountryFilterProps } from "./CountryFilter";
import CountryPicker, { type CountryPickerProps } from "./CountryPicker";
import { DEFAULT_THEME, type Theme, ThemeProvider } from "./CountryTheme";
import type { FlagButtonProps } from "./FlagButton";
import { type Country, type CountryCode, type Region, type Subregion, type TranslationLanguageCode } from "./types";

export type CountryPickerModalProps = CountryPickerProps & {
    allowFontScaling?: boolean;
    countryCode: CountryCode;
    region?: Region;
    subregion?: Subregion;
    countryCodes?: CountryCode[];
    excludeCountries?: CountryCode[];
    preferredCountries?: CountryCode[];
    theme?: Theme;
    translation?: TranslationLanguageCode;
    modalSafeAreaEdges?: Edge[];
    modalProps?: ModalProps;
    filterProps?: CountryFilterProps;
    flatListProps?: FlatListProps<Country>;
    placeholder?: string;
    withAlphaFilter?: boolean;
    withCallingCode?: boolean;
    withCurrency?: boolean;
    withEmoji?: boolean;
    withCountryNameButton?: boolean;
    withCurrencyButton?: boolean;
    withCallingCodeButton?: boolean;
    withCloseButton?: boolean;
    withFlagButton?: boolean;
    withFilter?: boolean;
    withFlag?: boolean;
    withModal?: boolean;
    disableNativeModal?: boolean;
    visible?: boolean;
    containerButtonStyle?: StyleProp<ViewStyle>;
    renderFlagButton?(props: FlagButtonProps): ReactNode;
    renderCountryFilter?(props: CountryFilterProps): ReactNode;
    onSelect(country: Country): void;
    onOpen?(): void;
    onClose?(): void;
    onError?(error: unknown): void;
};

const Main: React.FC<CountryPickerModalProps> = ({
    onSelect = () => {},
    withEmoji = true,
    theme,
    translation,
    ...props
}) => {
    return (
        <ThemeProvider theme={{ ...DEFAULT_THEME, ...theme }}>
            <CountryProvider value={{ ...DEFAULT_COUNTRY_CONTEXT, translation }}>
                <CountryPicker onSelect={onSelect} withEmoji={withEmoji} {...props} />
            </CountryProvider>
        </ThemeProvider>
    );
};

export default Main;
export { default as CountryFilter } from "./CountryFilter";
export { default as CountryList } from "./CountryList";
export { default as CountryModal } from "./CountryModal";
export { default as CountryModalProvider } from "./CountryModalProvider";
export {
    getCountriesAsync as getAllCountries,
    getCountryCallingCodeAsync as getCallingCode,
    loadDataAsync
} from "./CountryService";
export { DARK_THEME, DEFAULT_THEME } from "./CountryTheme";
export { Flag } from "./Flag";
export { FlagButton } from "./FlagButton";
export { HeaderModal } from "./HeaderModal";
export * from "./types";
export type { CountryFilterProps, CountryPickerProps };
