/**
 * The picker's slide-in animation.
 *
 * This is not a cosmetic test. The modal is positioned entirely by `translateY`, so a value that
 * does not survive a re-render is not a janky animation — it is a picker that cannot be opened.
 */
import { act, render } from "@testing-library/react-native";
import { Animated, Dimensions, Text } from "react-native";

import AnimatedModal from "../countryPickerModal/AnimatedModal";

const OFF_SCREEN = Dimensions.get("window").height;

const SCALE = Dimensions.get("window").scale;
const PORTRAIT = { width: Dimensions.get("window").width, height: OFF_SCREEN };
/** Same device turned on its side: the closed position has to shrink with it. */
const LANDSCAPE = { width: OFF_SCREEN, height: PORTRAIT.width };

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

/**
 * The component animates on the native driver, and the native animated module is mocked away
 * under jest — the JS-side value never moves, so every assertion would read the initial number
 * whatever the component did. Re-pointing `timing` at the JS driver makes the value observable
 * without changing which value the component animates, which is the thing under test.
 */
const useJsDriver = () => {
    const timing = Animated.timing;
    jest.spyOn(Animated, "timing").mockImplementation((value, config) =>
        timing(value, { ...config, useNativeDriver: false })
    );
};

/** Run the animation to completion. */
const settle = async () => {
    await act(async () => {
        jest.advanceTimersByTime(1000);
    });
};

const translateYOf = (view: { toJSON: () => unknown }): number => {
    const json = view.toJSON() as { props: { style: { transform: { translateY: number }[] } } };
    return json.props.style.transform[0]!.translateY;
};

const renderModal = async (visible: boolean) =>
    render(
        <AnimatedModal visible={visible}>
            <Text testID="child">countries</Text>
        </AnimatedModal>
    );

describe("AnimatedModal", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        useJsDriver();
    });

    afterEach(async () => {
        await rotateTo(PORTRAIT.width, PORTRAIT.height);
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it("starts off-screen when closed", async () => {
        const view = await renderModal(false);

        expect(translateYOf(view)).toBe(OFF_SCREEN);
    });

    it("slides into view when opened", async () => {
        const view = await renderModal(false);

        await view.rerender(
            <AnimatedModal visible>
                <Text testID="child">countries</Text>
            </AnimatedModal>
        );
        await settle();

        expect(translateYOf(view)).toBe(0);
    });

    it("stays in view across a re-render that does not change visibility", async () => {
        // The country list resolves asynchronously and re-renders the open modal. When the
        // animated value was rebuilt on each render, that re-render put the modal back at
        // `height` with no animation left to bring it down, so the picker vanished the moment
        // its contents arrived.
        const view = await renderModal(true);
        await settle();
        expect(translateYOf(view)).toBe(0);

        await view.rerender(
            <AnimatedModal visible>
                <Text testID="child">countries, now loaded</Text>
            </AnimatedModal>
        );

        expect(translateYOf(view)).toBe(0);
    });

    it("moves the closed position to the new screen height on rotation", async () => {
        // The height was read once at import time, so after a rotation the closed modal sat one
        // *old* screen down. Launching in landscape and turning to portrait left it parked in the
        // middle of the screen, covering the page it was supposed to be hidden behind.
        const view = await renderModal(false);
        expect(translateYOf(view)).toBe(PORTRAIT.height);

        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        expect(translateYOf(view)).toBe(LANDSCAPE.height);
    });

    it("does not animate the closed modal across the screen while rotating", async () => {
        // Sliding from the old height to the new one would drag it through the visible area.
        // Closed means gone, so the position changes in one step.
        const view = await renderModal(false);

        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        // Read before any timer runs: already in place, with nothing left to animate.
        expect(translateYOf(view)).toBe(LANDSCAPE.height);
    });

    it("still slides in when opened after a rotation", async () => {
        const view = await renderModal(false);
        await rotateTo(LANDSCAPE.width, LANDSCAPE.height);

        await view.rerender(
            <AnimatedModal visible>
                <Text testID="child">countries</Text>
            </AnimatedModal>
        );
        await settle();

        expect(translateYOf(view)).toBe(0);
    });

    it("can be reopened after being closed", async () => {
        const view = await renderModal(true);
        await settle();

        const close = (
            <AnimatedModal visible={false}>
                <Text testID="child">countries</Text>
            </AnimatedModal>
        );
        await view.rerender(close);
        await settle();
        expect(translateYOf(view)).toBe(OFF_SCREEN);

        await view.rerender(
            <AnimatedModal visible>
                <Text testID="child">countries</Text>
            </AnimatedModal>
        );
        await settle();

        expect(translateYOf(view)).toBe(0);
    });
});
