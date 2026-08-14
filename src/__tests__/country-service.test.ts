import { search } from "../countryPickerModal/CountryService";
import type { Country } from "../countryPickerModal/types";

const country = (cca2: string, name: string, callingCode: string): Country =>
    ({ cca2, name, callingCode: [callingCode], flag: "flag-" + cca2, region: "Asia" }) as unknown as Country;

const ASIA = [country("VN", "Vietnam", "84"), country("JP", "Japan", "81")];
const EUROPE = [country("FR", "France", "33"), country("DE", "Germany", "49")];

describe("search", () => {
    it("returns everything when the filter is empty", () => {
        expect(search("", ASIA)).toEqual(ASIA);
    });

    it("matches on name", () => {
        expect(search("Vietnam", ASIA).map((c) => c.cca2)).toEqual(["VN"]);
    });

    it("matches on calling code", () => {
        expect(search("84", ASIA).map((c) => c.cca2)).toEqual(["VN"]);
    });

    // Red test 4 — the Fuse index is a module-level `let`, built once from whichever data set
    // reached `search` first and never rebuilt. A second picker with different data searches
    // the first picker's countries.
    it("reflects the data set it was given, not the one it saw first", () => {
        expect(search("Vietnam", ASIA).map((c) => c.cca2)).toEqual(["VN"]);

        expect(search("France", EUROPE).map((c) => c.cca2)).toEqual(["FR"]);
    });

    it("returns nothing for an empty data set", () => {
        expect(search("Vietnam", [])).toEqual([]);
    });
});
