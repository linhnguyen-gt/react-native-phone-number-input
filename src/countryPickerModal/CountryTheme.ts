import { createTheming } from "@callstack/react-theme-provider";
import { Platform } from "react-native";

export const DEFAULT_THEME = {
    primaryColor: "#ccc",
    primaryColorVariant: "#eee",
    backgroundColor: "#ffffff",
    onBackgroundTextColor: "#000000",
    fontSize: 16,
    fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        web: "Arial"
    }),
    filterPlaceholderTextColor: "#aaa",
    activeOpacity: 0.5,
    // Left unset so `useItemHeight` can size a row against the window being rendered to. The key
    // stays declared, and typed, because `Theme` is derived from this object and callers set it.
    itemHeight: undefined as number | undefined,
    flagSize: Platform.select({ android: 20, default: 30 }),
    flagSizeButton: Platform.select({ android: 20, default: 30 })
};
export const DARK_THEME = {
    ...DEFAULT_THEME,
    primaryColor: "#222",
    primaryColorVariant: "#444",
    backgroundColor: "#000",
    onBackgroundTextColor: "#fff"
};
export type Theme = Partial<typeof DEFAULT_THEME>;

const { ThemeProvider, useTheme } = createTheming<Theme>(DEFAULT_THEME);

export { ThemeProvider, useTheme };
