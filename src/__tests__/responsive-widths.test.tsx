/**
 * The input's widths are proportions of the window, so they have to be read from the window the
 * component is rendering on — not the one the module happened to be imported on.
 *
 * The percentages were previously resolved at import time and frozen into `StyleSheet.create`,
 * which meant a device that rotated kept a width derived from its previous orientation for the
 * rest of the session: 80% of a portrait phone is about a third of the same device in landscape.
 */
import { act, render, type RenderResult } from "@testing-library/react-native";
import { Dimensions } from "react-native";

import PhoneInput from "../index";
import { TEST_IDS } from "../test-utils/render-phone-input";

const SCALE = 2;

/** Resize the window the way the native side does, so `useWindowDimensions` re-renders. */
const setWindow = (width: number, height: number) => {
    const pixels = { width: width * SCALE, height: height * SCALE, scale: SCALE, fontScale: SCALE };
    (Dimensions as unknown as { set: (dims: unknown) => void }).set({
        windowPhysicalPixels: pixels,
        screenPhysicalPixels: pixels
    });
};

/** The same resize, flushed, for use once a component is mounted and listening. */
const rotateTo = async (width: number, height: number) => {
    await act(async () => {
        setWindow(width, height);
    });
};

const PORTRAIT = { width: 750, height: 1334 };
const LANDSCAPE = { width: 1334, height: 750 };

type WidthStyle = { width?: number } | false | undefined;

/**
 * Flattened width the country button actually renders with.
 *
 * The style is an array whose later entries win, so the last width in it is the one that applies —
 * which is what makes the caller-override case below meaningful rather than incidental.
 */
const buttonWidth = (view: RenderResult): number | undefined => {
    const style = view.getByTestId(TEST_IDS.countryButton).props.style as WidthStyle | WidthStyle[];
    const entries: WidthStyle[] = Array.isArray(style) ? style : [style];
    return entries.reduce<number | undefined>((found, entry) => (entry ? (entry.width ?? found) : found), undefined);
};

describe("proportional widths", () => {
    beforeEach(() => {
        setWindow(PORTRAIT.width, PORTRAIT.height);
    });

    afterAll(() => {
        setWindow(PORTRAIT.width, PORTRAIT.height);
    });

    it("gives the country button 20 percent of the window", async () => {
        const view = await render(<PhoneInput defaultCode="US" />);

        expect(buttonWidth(view)).toBe(150);
    });

    it("widens the country button for the second layout", async () => {
        const view = await render(<PhoneInput defaultCode="US" layout="second" />);

        // 23 percent, replacing the base width rather than sitting behind it.
        expect(buttonWidth(view)).toBe(173);
    });

    it("follows the window when the device rotates", async () => {
        const view = await render(<PhoneInput defaultCode="US" />);
        expect(buttonWidth(view)).toBe(150);

        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        // 20 percent of the landscape width. A width frozen at import time stays at 150 here,
        // leaving the input a third of the size it asks for.
        expect(buttonWidth(view)).toBe(267);
    });

    it("keeps a caller's own width winning over the computed one", async () => {
        const view = await render(<PhoneInput defaultCode="US" flagButtonStyle={{ width: 42 }} />);

        expect(buttonWidth(view)).toBe(42);
    });
});
