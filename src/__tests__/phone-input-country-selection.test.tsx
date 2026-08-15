import { renderPhoneInput } from "../test-utils/render-phone-input";

const TWO_COUNTRIES = { countryCodes: ["US", "VN"] as const };

describe("initial country", () => {
    it("lets defaultCallingCode win over defaultCode, as documented", async () => {
        const input = await renderPhoneInput({ defaultCode: "US", defaultCallingCode: "65", layout: "second" });

        // The two lookups used to race, and the defaultCode one resolved a microtask later, so it
        // always won — leaving the Singapore flag selected above a "+1" label.
        expect(input.callingCode()).toBe("+65");
        expect(input.ref.current?.getCountryCode()).toBe("SG");
        expect(input.ref.current?.getCallingCode()).toBe("65");
    });

    it("resolves the calling code from defaultCode when that is all it is given", async () => {
        const input = await renderPhoneInput({ defaultCode: "US", layout: "second" });

        expect(input.callingCode()).toBe("+1");
    });
});

describe("country selection", () => {
    it("opens the picker from the flag button", async () => {
        const input = await renderPhoneInput({
            defaultCode: "US",
            countryPickerProps: { countryCodes: [...TWO_COUNTRIES.countryCodes] }
        });

        await input.openPicker();

        expect(await input.view.findByTestId("country-selector-VN")).toBeTruthy();
    });

    it("updates the calling code when a country is picked", async () => {
        const input = await renderPhoneInput({
            defaultCode: "US",
            layout: "second",
            countryPickerProps: { countryCodes: [...TWO_COUNTRIES.countryCodes] }
        });

        expect(input.callingCode()).toBe("+1");

        await input.openPicker();
        await input.selectCountry("VN");

        expect(input.callingCode()).toBe("+84");
    });

    it("reports the selected country to onChangeCountry", async () => {
        const onChangeCountry = jest.fn();
        const input = await renderPhoneInput({
            defaultCode: "US",
            onChangeCountry,
            countryPickerProps: { countryCodes: [...TWO_COUNTRIES.countryCodes] }
        });

        await input.openPicker();
        await input.selectCountry("VN");

        expect(onChangeCountry).toHaveBeenCalledWith(expect.objectContaining({ cca2: "VN" }));
    });

    it("exposes the selected country through the ref", async () => {
        const input = await renderPhoneInput({
            defaultCode: "US",
            countryPickerProps: { countryCodes: [...TWO_COUNTRIES.countryCodes] }
        });

        await input.openPicker();
        await input.selectCountry("VN");

        expect(input.ref.current!.getCountryCode()).toBe("VN");
        expect(input.ref.current!.getCallingCode()).toBe("84");
    });

    it("keeps the typed digits when the country changes", async () => {
        const input = await renderPhoneInput({
            defaultCode: "US",
            countryPickerProps: { countryCodes: [...TWO_COUNTRIES.countryCodes] }
        });

        await input.type("912345678");
        await input.openPicker();
        await input.selectCountry("VN");

        expect(input.displayedValue()).toBe("912345678");
    });
});
