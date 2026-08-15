import * as React from "react";
import { type ViewStyle, useWindowDimensions } from "react-native";

/**
 * The input's proportional widths, resolved against the current window.
 *
 * These were percentages baked into `StyleSheet.create` at import time, which made them a
 * property of whichever screen the module happened to load on rather than of the screen the
 * component is rendering on. Reading the window through a hook is what `CountryList` already
 * does, and it is the only way the widths survive a rotation, a foldable unfolding, or a
 * resizable window on tablets and desktop targets.
 *
 * Returned as styles rather than numbers so callers splice them into an existing style array
 * ahead of the caller's own overrides, which keeps `containerStyle` and `flagButtonStyle`
 * winning as they always did.
 */
export interface ResponsiveWidths {
    /** The component's outer container. */
    container: ViewStyle;
    /** The flag and calling-code button. */
    flagButton: ViewStyle;
    /** Extra width the `second` layout gives that button, replacing the base width. */
    flagButtonExtra: ViewStyle;
}

const CONTAINER_PERCENT = 80;
const FLAG_BUTTON_PERCENT = 20;
const FLAG_BUTTON_SECOND_LAYOUT_PERCENT = 23;

const percentOf = (width: number, percentage: number): number => Math.round((width * percentage) / 100);

export function useResponsiveWidths(): ResponsiveWidths {
    const { width } = useWindowDimensions();

    return React.useMemo(
        () => ({
            container: { width: percentOf(width, CONTAINER_PERCENT) },
            flagButton: { width: percentOf(width, FLAG_BUTTON_PERCENT) },
            flagButtonExtra: { width: percentOf(width, FLAG_BUTTON_SECOND_LAYOUT_PERCENT) }
        }),
        [width]
    );
}
