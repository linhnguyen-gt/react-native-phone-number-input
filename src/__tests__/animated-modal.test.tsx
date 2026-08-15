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

    afterEach(() => {
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
