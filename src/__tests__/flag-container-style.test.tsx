/**
 * `Flag`'s own container (`width: 30, marginRight: 10`) used to be hardcoded, with no way for a
 * caller to resize the flag or the gap it leaves before the dropdown arrow. `flagContainerStyle`
 * is merged after that default, the same way `flagButtonStyle` already wins over the computed
 * button width in `responsive-widths.test.tsx`.
 */
import { render } from "@testing-library/react-native";

import PhoneInput from "../index";
import { TEST_IDS } from "../test-utils/render-phone-input";

type FlagStyle = { width?: number; marginRight?: number } | false | undefined;

const flagStyle = (
    getByTestId: (id: string) => { props: { style?: FlagStyle | FlagStyle[] } }
): { width?: number; marginRight?: number } => {
    const style = getByTestId("phone-input-flag").props.style;
    const entries: FlagStyle[] = Array.isArray(style) ? style : [style];
    return entries.reduce<{ width?: number; marginRight?: number }>(
        (found, entry) =>
            entry ? { width: entry.width ?? found.width, marginRight: entry.marginRight ?? found.marginRight } : found,
        {}
    );
};

describe("flag container style", () => {
    it("keeps the default 30/10 box when no override is given", async () => {
        const view = await render(<PhoneInput defaultCode="US" layout="first" />);

        expect(flagStyle(view.getByTestId)).toEqual({ width: 30, marginRight: 10 });
    });

    it("lets a caller resize the flag and the gap it leaves", async () => {
        const view = await render(
            <PhoneInput defaultCode="US" layout="first" flagContainerStyle={{ width: 20, marginRight: 4 }} />
        );

        expect(flagStyle(view.getByTestId)).toEqual({ width: 20, marginRight: 4 });
    });

    it("does not render the flag at all in the second layout, override or not", async () => {
        const view = await render(<PhoneInput defaultCode="US" layout="second" flagContainerStyle={{ width: 20 }} />);

        expect(view.queryByTestId(TEST_IDS.countryButton)).toBeTruthy();
        expect(view.queryByTestId("phone-input-flag")).toBeNull();
    });
});
