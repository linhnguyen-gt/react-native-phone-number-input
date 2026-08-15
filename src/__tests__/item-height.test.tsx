/**
 * The picker's row height.
 *
 * It was 7% of the window resolved once, at import time, and stored in `DEFAULT_THEME`. That made
 * it a property of whichever screen the module loaded on: after a rotation the list kept rows
 * sized for the previous orientation, and the virtualization maths — `getItemLayout`,
 * `initialNumToRender` — was computed from the same stale number.
 */
import { act, render, type RenderResult } from "@testing-library/react-native";
import { Dimensions, Text } from "react-native";

import { DEFAULT_THEME } from "../countryPickerModal";
import { useItemHeight } from "../countryPickerModal/useItemHeight";
import { renderPhoneInput } from "../test-utils/render-phone-input";

const SCALE = Dimensions.get("window").scale;
const PORTRAIT = { width: 750, height: 1334 };
const LANDSCAPE = { width: 1334, height: 750 };

/** 7% of 1334 and of 750. The test env reports iOS, so no status bar is deducted. */
const PORTRAIT_ROW = 93;
const LANDSCAPE_ROW = 53;

/** One device-pixel border sits under every row and is counted into the item layout. */
const SEPARATOR = 2 / SCALE;

const setWindow = (width: number, height: number) => {
    const pixels = { width: width * SCALE, height: height * SCALE, scale: SCALE, fontScale: SCALE };
    (Dimensions as unknown as { set: (dims: unknown) => void }).set({
        windowPhysicalPixels: pixels,
        screenPhysicalPixels: pixels
    });
};

const rotateTo = async (width: number, height: number) => {
    await act(async () => {
        setWindow(width, height);
    });
};

/** Renders whatever the hook resolves to, so it can be asserted without a picker around it. */
const Probe = ({ themeItemHeight }: { themeItemHeight?: number }) => (
    <Text testID="resolved">{String(useItemHeight(themeItemHeight))}</Text>
);

const resolved = (view: RenderResult): number => Number(view.getByTestId("resolved").props.children);

beforeEach(() => {
    setWindow(PORTRAIT.width, PORTRAIT.height);
});

afterEach(async () => {
    await rotateTo(PORTRAIT.width, PORTRAIT.height);
});

describe("useItemHeight", () => {
    it("sizes a row as a share of the window when the theme names no height", async () => {
        const view = await render(<Probe />);

        expect(resolved(view)).toBe(PORTRAIT_ROW);
    });

    it("follows the window when the device rotates", async () => {
        const view = await render(<Probe />);
        expect(resolved(view)).toBe(PORTRAIT_ROW);

        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        // A height frozen at import time stays at 93 here, so a landscape screen shows a handful
        // of portrait-sized rows.
        expect(resolved(view)).toBe(LANDSCAPE_ROW);
    });

    it("lets a theme height win outright", async () => {
        const view = await render(<Probe themeItemHeight={40} />);
        expect(resolved(view)).toBe(40);

        // An explicit choice is not a percentage of anything, so rotating must not rescale it.
        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        expect(resolved(view)).toBe(40);
    });
});

describe("the list built from it", () => {
    const openList = async (theme?: { itemHeight?: number }) => {
        const input = await renderPhoneInput({
            defaultCode: "US",
            countryPickerProps: {
                countryCodes: ["US", "VN"],
                ...(theme ? { theme: { ...DEFAULT_THEME, ...theme } } : {})
            }
        });
        await input.openPicker();
        return input.view;
    };

    const itemLength = (view: RenderResult): number => {
        const getItemLayout = view.getByTestId("list-countries").props.getItemLayout as (
            data: unknown,
            index: number
        ) => { length: number };

        return getItemLayout(null, 0).length;
    };

    it("measures items against the current window", async () => {
        const view = await openList();

        expect(itemLength(view)).toBe(PORTRAIT_ROW + SEPARATOR);
    });

    it("re-measures items after a rotation", async () => {
        const view = await openList();
        expect(itemLength(view)).toBe(PORTRAIT_ROW + SEPARATOR);

        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        // Stale row heights here desynchronise getItemLayout from what is actually rendered,
        // which is what makes scrolling land on the wrong row.
        expect(itemLength(view)).toBe(LANDSCAPE_ROW + SEPARATOR);
    });

    it("honours a theme height in the virtualization maths too", async () => {
        const view = await openList({ itemHeight: 40 });

        expect(itemLength(view)).toBe(40 + SEPARATOR);
    });
});
