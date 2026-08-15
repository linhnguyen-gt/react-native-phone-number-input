/**
 * The masking feature's user-facing half: the length cap, and E.164 output.
 *
 * The E.164 change applies in every mode, masked or not — a formatter that behaves differently
 * depending on an unrelated display flag is the bug pattern this release removes.
 */
import { renderPhoneInput } from "../test-utils/render-phone-input";

describe("length cap", () => {
    it("stops at the mask's capacity for a country with an authored mask", async () => {
        const onChangeText = jest.fn();
        const input = await renderPhoneInput({ withMask: true, defaultCode: "US", onChangeText });

        // The US mask is (###) ###-####: ten digits.
        await input.type("20255501239999");

        expect(onChangeText).toHaveBeenLastCalledWith("2025550123");
        expect(input.displayedValue()).toBe("(202) 555-0123");
    });

    it("does not cap a country that falls through to the DEFAULT mask", async () => {
        const onChangeText = jest.fn();
        // AF has no authored mask, so the pattern is a guess and must not block input.
        const input = await renderPhoneInput({ withMask: true, defaultCode: "AF", onChangeText });

        await input.type("70123456789012345");

        expect(onChangeText).toHaveBeenLastCalledWith("70123456789012345");
    });

    it("does not cap when masking is off", async () => {
        const onChangeText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "US", onChangeText });

        await input.type("20255501239999");

        expect(onChangeText).toHaveBeenLastCalledWith("20255501239999");
    });
});

describe("E.164 output", () => {
    it("drops the trunk zero in a region that drops it", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "VN", onChangeFormattedText });

        await input.type("0912345678");

        expect(onChangeFormattedText).toHaveBeenLastCalledWith("+84912345678");
    });

    it("keeps the trunk zero in a region that keeps it", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "IT", onChangeFormattedText });

        await input.type("0612345678");

        expect(onChangeFormattedText).toHaveBeenLastCalledWith("+390612345678");
    });

    it("applies with masking on as well as off", async () => {
        const masked = jest.fn();
        const plain = jest.fn();

        const withMask = await renderPhoneInput({ withMask: true, defaultCode: "VN", onChangeFormattedText: masked });
        await withMask.type("091 234 5678");

        const withoutMask = await renderPhoneInput({ defaultCode: "VN", onChangeFormattedText: plain });
        await withoutMask.type("0912345678");

        expect(masked).toHaveBeenLastCalledWith("+84912345678");
        expect(plain).toHaveBeenLastCalledWith("+84912345678");
    });

    it("emits the same string from the callback and from the ref", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({ defaultCode: "VN", onChangeFormattedText });

        await input.type("0912345678");

        const fromCallback = onChangeFormattedText.mock.calls.at(-1)![0];
        const { formattedNumber } = input.ref.current!.getNumberAfterPossiblyEliminatingZero();

        expect(formattedNumber).toBe(fromCallback);
    });

    it("re-formats for the newly selected country", async () => {
        const onChangeFormattedText = jest.fn();
        const input = await renderPhoneInput({
            defaultCode: "US",
            onChangeFormattedText,
            countryPickerProps: { countryCodes: ["US", "VN"] }
        });

        await input.type("0912345678");
        await input.openPicker();
        await input.selectCountry("VN");

        expect(onChangeFormattedText).toHaveBeenLastCalledWith("+84912345678");
    });
});

describe("the cap on paths that do not go through a keystroke", () => {
    it("caps a seeded defaultValue instead of waiting for the next keystroke", async () => {
        const input = await renderPhoneInput({
            withMask: true,
            defaultCode: "US",
            // Punctuated and over-long. The value is a national number, so every digit in it
            // counts — a calling-code prefix would be consumed as one.
            defaultValue: "(202) 555-01239999"
        });

        expect(input.displayedValue()).toBe("(202) 555-0123");
        expect(input.ref.current?.getNumberAfterPossiblyEliminatingZero().number).toBe("2025550123");
    });

    it("caps a controlled value", async () => {
        const input = await renderPhoneInput({ withMask: true, defaultCode: "US", value: "20255501239999" });

        expect(input.displayedValue()).toBe("(202) 555-0123");
    });

    it("truncates to the new country's mask on selection, and says so", async () => {
        const onChangeText = jest.fn();
        // AF has no authored mask, so 14 digits are accepted; US holds ten.
        const input = await renderPhoneInput({
            withMask: true,
            defaultCode: "AF",
            onChangeText,
            countryPickerProps: { countryCodes: ["AF", "US"] }
        });

        await input.type("12345678901234");
        onChangeText.mockClear();

        await input.openPicker();
        await input.selectCountry("US");

        expect(input.displayedValue()).toBe("(123) 456-7890");
        // The four dropped digits are reported, rather than disappearing silently until the user
        // happens to type again.
        expect(onChangeText).toHaveBeenLastCalledWith("1234567890");
    });
});

describe("isValidNumber", () => {
    it("keeps a trunk zero the region keeps", async () => {
        const input = await renderPhoneInput({ defaultCode: "IT" });

        // Stripping the zero by hand turned this valid Italian number invalid, while
        // onChangeFormattedText emitted +390612345678 for the very same string.
        expect(input.ref.current?.isValidNumber("0612345678")).toBe(true);
    });

    it("drops a trunk zero the region drops", async () => {
        const input = await renderPhoneInput({ defaultCode: "VN" });

        expect(input.ref.current?.isValidNumber("0912345678")).toBe(true);
    });

    it("rejects an empty or non-numeric string", async () => {
        const input = await renderPhoneInput({ defaultCode: "US" });

        expect(input.ref.current?.isValidNumber("")).toBe(false);
        expect(input.ref.current?.isValidNumber("abc")).toBe(false);
    });
});
