/**
 * The picker's state races, and the recovery paths that make a failed load survivable.
 *
 * `getCountriesAsync` is mocked with a promise this file resolves by hand, so the "opened while
 * the data was still loading" window is a deliberate step rather than a timer to wait on.
 */
import { act, fireEvent } from "@testing-library/react-native";

import type { Country } from "../countryPickerModal/types";
import { renderPhoneInput } from "../test-utils/render-phone-input";

jest.mock("../countryPickerModal/CountryService", () => ({
    ...jest.requireActual("../countryPickerModal/CountryService"),
    getCountriesAsync: jest.fn()
}));

const { getCountriesAsync } = require("../countryPickerModal/CountryService");

const country = (cca2: string, name: string, callingCode: string): Country =>
    ({ cca2, name, callingCode: [callingCode], flag: "flag", region: "Asia" }) as unknown as Country;

const COUNTRIES = [country("US", "United States", "1"), country("VN", "Vietnam", "84")];

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

/** Let the mocked promise's `.then` chain and the state updates it triggers flush. */
const settle = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

beforeEach(() => {
    (getCountriesAsync as jest.Mock).mockReset();
});

describe("opening the picker while country data is loading", () => {
    it("stays open when the data resolves afterwards", async () => {
        const load = deferred<Country[]>();
        (getCountriesAsync as jest.Mock).mockReturnValue(load.promise);

        const input = await renderPhoneInput({ defaultCode: "US" });

        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));
        expect(input.view.queryByTestId("list-countries")).toBeTruthy();

        load.resolve(COUNTRIES);
        await settle();

        expect(input.view.queryByTestId("list-countries")).toBeTruthy();
        expect(input.view.queryByTestId("country-selector-VN")).toBeTruthy();
    });

    it("can still be closed and reopened after that resolution", async () => {
        const load = deferred<Country[]>();
        (getCountriesAsync as jest.Mock).mockReturnValue(load.promise);

        const input = await renderPhoneInput({ defaultCode: "US" });

        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));
        load.resolve(COUNTRIES);
        await settle();

        // Selecting a country closes the modal through the normal path.
        await fireEvent.press(input.view.getByTestId("country-selector-VN"));
        expect(input.view.queryByTestId("list-countries")).toBeNull();

        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));
        expect(input.view.queryByTestId("list-countries")).toBeTruthy();
    });
});

describe("a failed load", () => {
    it("reports the error to onError instead of only warning", async () => {
        const onError = jest.fn();
        const failure = new Error("offline");
        (getCountriesAsync as jest.Mock).mockRejectedValue(failure);

        await renderPhoneInput({ defaultCode: "US", countryPickerProps: { onError } });
        await settle();

        expect(onError).toHaveBeenCalledWith(failure);
    });

    it("renders an error state rather than a blank modal", async () => {
        (getCountriesAsync as jest.Mock).mockRejectedValue(new Error("offline"));

        const input = await renderPhoneInput({ defaultCode: "US" });
        await settle();

        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));

        expect(input.view.queryByTestId("country-list-error")).toBeTruthy();
    });

    it("retries when the picker is reopened", async () => {
        (getCountriesAsync as jest.Mock).mockRejectedValueOnce(new Error("offline"));

        const input = await renderPhoneInput({ defaultCode: "US" });
        await settle();

        // First attempt failed at mount; opening triggers a refetch of the empty list.
        (getCountriesAsync as jest.Mock).mockResolvedValue(COUNTRIES);
        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));
        await settle();

        expect(await input.view.findByTestId("country-selector-VN")).toBeTruthy();
    });
});

describe("the loader effect reacts to every prop it reads", () => {
    it("re-filters when excludeCountries changes after mount", async () => {
        (getCountriesAsync as jest.Mock).mockImplementation(
            async (
                _flagType: unknown,
                _translation: unknown,
                _region: unknown,
                _subregion: unknown,
                _countryCodes: unknown,
                excludeCountries?: string[]
            ) => COUNTRIES.filter((c) => !excludeCountries?.includes(c.cca2))
        );

        const input = await renderPhoneInput({ defaultCode: "US" });
        await settle();

        await fireEvent.press(input.view.getByTestId("phone-input-country-button"));
        expect(input.view.queryByTestId("country-selector-VN")).toBeTruthy();

        await input.setProps({ countryPickerProps: { excludeCountries: ["VN"] } });
        await settle();

        expect(input.view.queryByTestId("country-selector-VN")).toBeNull();
        expect(input.view.queryByTestId("country-selector-US")).toBeTruthy();
    });
});
