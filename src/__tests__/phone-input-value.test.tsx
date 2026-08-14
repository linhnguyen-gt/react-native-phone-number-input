/**
 * The value contract: what the field displays, what it emits, and who owns it.
 *
 * Most of this file is red against 3.8.0. Each `it` states the contract phase 02 establishes,
 * not the behaviour that exists now.
 */
import { renderPhoneInput } from "../test-utils/render-phone-input";

describe("uncontrolled: defaultValue seeds, the user owns the rest", () => {
    // Red test 1 — state falls back to props whenever state is falsy, so an empty string is
    // indistinguishable from "not set yet" and the field snaps back to defaultValue.
    it("can be emptied after defaultValue seeded it", async () => {
        const input = await renderPhoneInput({ defaultValue: "123456" });

        expect(input.displayedValue()).toBe("123456");

        await input.type("12345");
        expect(input.displayedValue()).toBe("12345");

        await input.clear();
        expect(input.displayedValue()).toBe("");
    });

    // Red test 5 — defaultValue is a mount-time seed. It is re-read on every render today,
    // whenever internal state happens to be falsy.
    it("ignores defaultValue changing after mount", async () => {
        const input = await renderPhoneInput({ defaultValue: "111" });

        expect(input.displayedValue()).toBe("111");

        await input.setProps({ defaultValue: "222" });
        expect(input.displayedValue()).toBe("111");
    });

    it("emits the typed text to onChangeText", async () => {
        const onChangeText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "VN", onChangeText });

        await input.type("912345678");

        expect(onChangeText).toHaveBeenLastCalledWith("912345678");
    });
});

describe("controlled: value is the source of truth", () => {
    // Red test 2 — typing currently overwrites the parent's value from internal state.
    it("does not override value from internal state when the parent ignores the change", async () => {
        const input = await renderPhoneInput({ value: "111" });

        await input.type("222");

        expect(input.displayedValue()).toBe("111");
    });

    it("reflects a value changed from outside", async () => {
        const input = await renderPhoneInput({ value: "111" });

        await input.setProps({ value: "999" });

        expect(input.displayedValue()).toBe("999");
    });

    it("accepts the empty string as a value", async () => {
        const input = await renderPhoneInput({ value: "123456" });

        await input.setProps({ value: "" });

        expect(input.displayedValue()).toBe("");
    });
});

describe("controlled together with withMask", () => {
    // Red test 6 — the two features cancel out today: displayValue starts empty, so the raw
    // props.value is shown unmasked, and a later parent update is ignored.
    it("masks the parent's raw digits", async () => {
        const input = await renderPhoneInput({ withMask: true, defaultCode: "VN", value: "0912345678" });

        expect(input.displayedValue()).toBe("091 234 5678");
    });

    it("re-masks when the parent changes the value", async () => {
        const input = await renderPhoneInput({ withMask: true, defaultCode: "VN", value: "0912345678" });

        await input.setProps({ value: "0987654321" });

        expect(input.displayedValue()).toBe("098 765 4321");
    });

    it("emits raw digits, not the masked string", async () => {
        const onChangeText = jest.fn();
        const input = await renderPhoneInput({ withMask: true, defaultCode: "VN", onChangeText });

        await input.type("091 234 5678");

        expect(onChangeText).toHaveBeenLastCalledWith("0912345678");
    });
});

describe("no public output contains the string 'undefined'", () => {
    // Red test 3 — both call sites interpolate an `undefined`-able state into a template string.
    it("does not emit +<code>undefined when a country is selected before anything is typed", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({
            defaultCode: "US",
            onChangeFormattedText,
            countryPickerProps: { countryCodes: ["US", "VN"] }
        });

        await input.openPicker();
        await input.selectCountry("VN");

        expect(onChangeFormattedText).toHaveBeenCalled();
        for (const [emitted] of onChangeFormattedText.mock.calls) {
            expect(emitted).not.toContain("undefined");
        }
    });

    it("does not put undefined in the ref's formattedNumber on a fresh mount", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN" });

        const { formattedNumber } = input.ref.current!.getNumberAfterPossiblyEliminatingZero();

        expect(formattedNumber ?? "").not.toContain("undefined");
    });
});

describe("the ref reads the resolved value, not internal state", () => {
    // Red test 7a — a controlled consumer gets `{ number: undefined }` today, because the
    // method reads the internal state the parent never writes to.
    it("returns the parent's value while controlled", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN", value: "0912345678" });

        expect(input.ref.current!.getNumberAfterPossiblyEliminatingZero()).toEqual({
            number: "912345678",
            formattedNumber: "+84912345678"
        });
    });

    it("returns the typed value while uncontrolled", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN" });

        await input.type("0912345678");

        expect(input.ref.current!.getNumberAfterPossiblyEliminatingZero()).toEqual({
            number: "912345678",
            formattedNumber: "+84912345678"
        });
    });
});

describe("disabled", () => {
    // Characterization, not a red test — for the same reason as `isValidNumber`. `disabled` is
    // mirrored into state and reconciled in an effect, so `editable` lags the prop by one
    // commit; but React flushes that effect inside the same `act()` as the rerender, so the
    // intermediate commit is not observable through the rendered tree. The extra commit and the
    // torn window under interrupted rendering are real, and phase 02 still deletes the mirror.
    // This assertion must read identically before and after that deletion.
    it("takes effect on the same commit as the prop change", async () => {
        const input = await renderPhoneInput({ disabled: false });

        expect(input.view.getByTestId("phone-input-text").props.editable).toBe(true);

        await input.setProps({ disabled: true });

        expect(input.view.getByTestId("phone-input-text").props.editable).toBe(false);
    });
});
