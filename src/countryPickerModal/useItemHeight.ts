import { Platform, useWindowDimensions } from "react-native";

/** A row is this share of the usable height when the theme does not name a height itself. */
const ROW_PERCENT = 7;

/** The modal does not extend under the Android status bar, so that much height is not usable. */
const ANDROID_STATUS_BAR = 24;

/**
 * The height a country row should render at.
 *
 * The default used to be resolved once, at import time, and stored in `DEFAULT_THEME` — which made
 * it a property of whichever screen the module loaded on. After a rotation the list kept rows
 * sized for the previous orientation, so a landscape screen showed a handful of portrait-height
 * rows. `DEFAULT_THEME.itemHeight` is now left unset and the size is derived per render instead.
 *
 * A theme that does name a height still wins outright: it is an explicit choice by the caller and
 * is not a percentage of anything.
 *
 * @param themeItemHeight - `theme.itemHeight`, when the caller supplied one
 * @returns The row height in density-independent pixels
 */
export function useItemHeight(themeItemHeight?: number): number {
    const { height } = useWindowDimensions();
    const usable = Platform.OS === "android" ? height - ANDROID_STATUS_BAR : height;

    return themeItemHeight ?? Math.round((usable * ROW_PERCENT) / 100);
}
