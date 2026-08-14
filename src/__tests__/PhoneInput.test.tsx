/**
 * Characterization tests: behaviour that must survive this release unchanged.
 *
 * These render the component. The previous version of this file asserted on object literals
 * declared inside the test and covered none of the source.
 */
import { renderPhoneInput } from "../test-utils/render-phone-input";

describe("defaults", () => {
    it("starts on IN / +91 when nothing is configured", async () => {
        const input = await renderPhoneInput({});

        expect(input.ref.current!.getCountryCode()).toBe("IN");
        expect(input.callingCode()).toBe("+91");
    });

    it("resolves the calling code from defaultCode", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN" });

        expect(input.ref.current!.getCountryCode()).toBe("VN");
        expect(input.callingCode()).toBe("+84");
    });

    it("resolves the country from defaultCallingCode", async () => {
        const input = await renderPhoneInput({ defaultCallingCode: "84" });

        expect(input.ref.current!.getCountryCode()).toBe("VN");
        expect(input.callingCode()).toBe("+84");
    });
});

describe("layout and visibility props", () => {
    it("renders the calling code beside the input in the first layout", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN", layout: "first" });

        expect(input.callingCode()).toBe("+84");
    });

    it("renders the calling code inside the flag button in the second layout", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN", layout: "second" });

        expect(input.callingCode()).toBe("+84");
    });

    it("hides the calling code when showCountryCode is false", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN", showCountryCode: false });

        expect(input.callingCode()).toBeUndefined();
    });

    it("passes the placeholder through", async () => {
        const input = await renderPhoneInput({ placeholder: "Phone number" });

        expect(input.view.getByPlaceholderText("Phone number")).toBeTruthy();
    });

    it("makes the field read-only when disabled", async () => {
        const input = await renderPhoneInput({ disabled: true });

        expect(input.view.getByTestId("phone-input-text").props.editable).toBe(false);
    });
});

describe("onChangeFormattedText", () => {
    it("prefixes the calling code", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "VN", onChangeFormattedText });

        await input.type("912345678");

        expect(onChangeFormattedText).toHaveBeenLastCalledWith("+84912345678");
    });

    it("emits the empty string rather than a bare calling code when the field is cleared", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "VN", onChangeFormattedText });

        await input.type("912345678");
        await input.clear();

        expect(onChangeFormattedText).toHaveBeenLastCalledWith("");
    });
});

describe("isValidNumber", () => {
    // Characterization, not a red test. The fallback branch phase 02 deletes is unreachable in
    // both directions: it passes a calling code where a region code belongs, so it throws for
    // any input without a `+` prefix, and with a `+` prefix the primary parse already succeeded.
    // These four assertions must read identically before and after that deletion.
    it("accepts a valid E.164 number", async () => {
        const input = await renderPhoneInput({ defaultCode: "IN" });

        expect(input.ref.current!.isValidNumber("+919876543210")).toBe(true);
    });

    it("accepts a national number for the selected country", async () => {
        const input = await renderPhoneInput({ defaultCode: "IN" });

        expect(input.ref.current!.isValidNumber("09876543210")).toBe(true);
    });

    it("rejects a number that is too short", async () => {
        const input = await renderPhoneInput({ defaultCode: "IN" });

        expect(input.ref.current!.isValidNumber("123")).toBe(false);
    });

    it("rejects an empty string", async () => {
        const input = await renderPhoneInput({ defaultCode: "IN" });

        expect(input.ref.current!.isValidNumber("")).toBe(false);
    });
});
