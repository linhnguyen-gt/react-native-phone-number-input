/**
 * Render-cost regression tests, against the real 250-country data set.
 *
 * Row renders are counted through `Flag`, which every `CountryItem` renders exactly once. The
 * bounds asserted here are the measured post-optimisation values from phase 04, so a
 * regression that reintroduces per-render invalidation fails the suite rather than quietly
 * costing a full list of renders per keystroke.
 */
import { act, fireEvent } from "@testing-library/react-native";

import { renderPhoneInput } from "../test-utils/render-phone-input";

const flagRenders = { count: 0 };

jest.mock("../countryPickerModal/Flag", () => {
    const actual = jest.requireActual("../countryPickerModal/Flag");
    return {
        ...actual,
        Flag: (props: Record<string, unknown>) => {
            flagRenders.count += 1;
            return actual.Flag(props);
        }
    };
});

const settle = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

beforeEach(() => {
    flagRenders.count = 0;
});

describe("typing with the picker mounted", () => {
    it("does not re-render country rows for every keystroke", async () => {
        const input = await renderPhoneInput({ defaultCode: "US" });
        await input.openPicker();
        await settle();

        flagRenders.count = 0;
        for (const text of ["9", "91", "912", "9123", "91234"]) {
            await input.type(text);
        }

        // Measured before phase 04: 75 — every mounted row, five times over. After: 5, which
        // is the flag button's own flag re-rendering once per keystroke.
        expect(flagRenders.count).toBeLessThanOrEqual(5);
    });
});

describe("filtering the country list", () => {
    it("renders only the matching rows when the filter changes", async () => {
        const input = await renderPhoneInput({ defaultCode: "US" });
        await input.openPicker();
        await settle();

        flagRenders.count = 0;
        await fireEvent.changeText(input.view.getByPlaceholderText("Enter country name"), "Vietnam");
        await settle();

        expect(await input.view.findByTestId("country-selector-VN")).toBeTruthy();
        // One matching row plus the flag button. A rebuilt `renderItem` re-rendered every
        // mounted row instead.
        expect(flagRenders.count).toBeLessThanOrEqual(4);
    });
});

describe("emoji flags", () => {
    it("resolve without a loading state", async () => {
        const input = await renderPhoneInput({ defaultCode: "US" });
        await input.openPicker();
        await settle();

        expect(JSON.stringify(input.view.toJSON())).not.toContain("ActivityIndicator");
    });
});
