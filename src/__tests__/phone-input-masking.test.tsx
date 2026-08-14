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
