import {
    applyMask,
    capToMask,
    getCaretAfterEdit,
    getMaskForCountry,
    getMaxDigits,
    getNewCursorPosition,
    hasAuthoredMask,
    removeMask,
    toE164
} from "../maskUtils";

describe("maskUtils", () => {
    describe("removeMask", () => {
        it("should remove all non-digit characters", () => {
            expect(removeMask("(123) 456-7890")).toBe("1234567890");
            expect(removeMask("123 456 7890")).toBe("1234567890");
            expect(removeMask("123-456-7890")).toBe("1234567890");
            expect(removeMask("+1 (123) 456-7890")).toBe("11234567890");
        });

        it("should handle empty string", () => {
            expect(removeMask("")).toBe("");
        });

        it("should handle string with only digits", () => {
            expect(removeMask("1234567890")).toBe("1234567890");
        });

        it("should handle string with no digits", () => {
            expect(removeMask("abc-def")).toBe("");
        });
    });

    describe("getMaskForCountry", () => {
        it("should return correct mask for US", () => {
            expect(getMaskForCountry("US")).toBe("(###) ###-####");
        });

        it("should return correct mask for VN", () => {
            expect(getMaskForCountry("VN")).toBe("### ### ####");
        });

        it("should return correct mask for GB", () => {
            expect(getMaskForCountry("GB")).toBe("##### ######");
        });

        it("should return correct mask for CA", () => {
            expect(getMaskForCountry("CA")).toBe("(###) ###-####");
        });

        it("should return correct mask for AU", () => {
            expect(getMaskForCountry("AU")).toBe("#### ### ###");
        });

        it("should return correct mask for FR", () => {
            expect(getMaskForCountry("FR")).toBe("## ## ## ## ##");
        });

        it("should return correct mask for DE", () => {
            expect(getMaskForCountry("DE")).toBe("#### ########");
        });

        it("should return correct mask for JP", () => {
            expect(getMaskForCountry("JP")).toBe("###-####-####");
        });

        it("should return correct mask for CN", () => {
            expect(getMaskForCountry("CN")).toBe("### #### ####");
        });

        it("should return correct mask for IN", () => {
            expect(getMaskForCountry("IN")).toBe("##### #####");
        });

        it("should return default mask for unknown country", () => {
            // @ts-expect-error Testing with invalid country code
            expect(getMaskForCountry("XX")).toBe("### ### ### ###");
        });
    });

    describe("applyMask", () => {
        it("should apply US mask correctly", () => {
            const mask = "(###) ###-####";
            expect(applyMask("1234567890", mask)).toBe("(123) 456-7890");
            expect(applyMask("123456", mask)).toBe("(123) 456");
            expect(applyMask("123", mask)).toBe("(123");
        });

        it("should apply VN mask correctly", () => {
            const mask = "### ### ####";
            expect(applyMask("0123456789", mask)).toBe("012 345 6789");
            expect(applyMask("012345", mask)).toBe("012 345");
            expect(applyMask("012", mask)).toBe("012");
        });

        it("should apply GB mask correctly", () => {
            const mask = "##### ######";
            expect(applyMask("07700900123", mask)).toBe("07700 900123");
            expect(applyMask("07700", mask)).toBe("07700");
        });

        it("should handle empty input", () => {
            const mask = "(###) ###-####";
            expect(applyMask("", mask)).toBe("");
        });

        it("should handle input with existing formatting", () => {
            const mask = "(###) ###-####";
            expect(applyMask("(123) 456-7890", mask)).toBe("(123) 456-7890");
            expect(applyMask("123-456-7890", mask)).toBe("(123) 456-7890");
        });

        it("should handle input longer than mask", () => {
            const mask = "(###) ###-####";
            expect(applyMask("12345678901234", mask)).toBe("(123) 456-78901234");
        });

        it("should handle partial input", () => {
            const mask = "(###) ###-####";
            expect(applyMask("1", mask)).toBe("(1");
            expect(applyMask("12", mask)).toBe("(12");
            expect(applyMask("123", mask)).toBe("(123");
            expect(applyMask("1234", mask)).toBe("(123) 4");
        });
    });

    describe("getMaxDigits", () => {
        it("should count digits in US mask", () => {
            expect(getMaxDigits("(###) ###-####")).toBe(10);
        });

        it("should count digits in VN mask", () => {
            expect(getMaxDigits("### ### ####")).toBe(10);
        });

        it("should count digits in GB mask", () => {
            expect(getMaxDigits("##### ######")).toBe(11);
        });

        it("should handle mask with no digits", () => {
            expect(getMaxDigits("---")).toBe(0);
        });

        it("should handle empty mask", () => {
            expect(getMaxDigits("")).toBe(0);
        });
    });

    describe("Integration tests", () => {
        it("should handle complete phone number entry flow for US", () => {
            const mask = getMaskForCountry("US");
            const inputs = [
                "1",
                "12",
                "123",
                "1234",
                "12345",
                "123456",
                "1234567",
                "12345678",
                "123456789",
                "1234567890"
            ];
            const expected = [
                "(1",
                "(12",
                "(123",
                "(123) 4",
                "(123) 45",
                "(123) 456",
                "(123) 456-7",
                "(123) 456-78",
                "(123) 456-789",
                "(123) 456-7890"
            ];

            inputs.forEach((input, index) => {
                expect(applyMask(input, mask)).toBe(expected[index]);
            });
        });

        it("should handle complete phone number entry flow for VN", () => {
            const mask = getMaskForCountry("VN");
            const inputs = [
                "0",
                "01",
                "012",
                "0123",
                "01234",
                "012345",
                "0123456",
                "01234567",
                "012345678",
                "0123456789"
            ];
            const expected = [
                "0",
                "01",
                "012",
                "012 3",
                "012 34",
                "012 345",
                "012 345 6",
                "012 345 67",
                "012 345 678",
                "012 345 6789"
            ];

            inputs.forEach((input, index) => {
                expect(applyMask(input, mask)).toBe(expected[index]);
            });
        });

        it("should handle paste operation", () => {
            const mask = getMaskForCountry("US");
            expect(applyMask("1234567890", mask)).toBe("(123) 456-7890");
            expect(applyMask("(123) 456-7890", mask)).toBe("(123) 456-7890");
            expect(applyMask("123-456-7890", mask)).toBe("(123) 456-7890");
        });

        it("should handle country switching", () => {
            const digits = "1234567890";
            const usMask = getMaskForCountry("US");
            const vnMask = getMaskForCountry("VN");

            expect(applyMask(digits, usMask)).toBe("(123) 456-7890");
            expect(applyMask(digits, vnMask)).toBe("123 456 7890");
        });
    });

    describe("hasAuthoredMask", () => {
        it("is true for a country with a hand-written pattern", () => {
            expect(hasAuthoredMask("US")).toBe(true);
            expect(hasAuthoredMask("VN")).toBe(true);
        });

        it("is false for a country that falls through to DEFAULT", () => {
            expect(hasAuthoredMask("AF")).toBe(false);
        });
    });

    describe("toE164", () => {
        it("drops the trunk zero where the region drops it", () => {
            expect(toE164("0912345678", "VN", "84")).toBe("+84912345678");
        });

        it("keeps the trunk zero where the region keeps it", () => {
            // Italy's leading zero is part of the number. A blanket strip would produce
            // +39612345678, which is not a valid Italian number.
            expect(toE164("0612345678", "IT", "39")).toBe("+390612345678");
        });

        it("formats a number with no leading zero", () => {
            expect(toE164("2025550123", "US", "1")).toBe("+12025550123");
        });

        it("ignores mask characters in the input", () => {
            expect(toE164("(202) 555-0123", "US", "1")).toBe("+12025550123");
        });

        it("returns the empty string for no input", () => {
            expect(toE164("", "VN", "84")).toBe("");
            expect(toE164("   ", "VN", "84")).toBe("");
        });

        it("falls back to a plain join when the number cannot be parsed", () => {
            // Half-typed numbers do not parse, and the callback still has to say something
            // useful on every keystroke.
            expect(toE164("9", "VN", "84")).toBe("+849");
        });

        it("falls back to the digits alone when there is no calling code either", () => {
            expect(toE164("9", "VN")).toBe("9");
        });
    });

    describe("getNewCursorPosition", () => {
        it("keeps the same digits behind the caret when the string is re-masked", () => {
            // "(202) 55|5-0123" — five digits behind the caret. After inserting a 9 there the
            // string becomes "(202) 559-5012", and the caret belongs after its fifth digit.
            expect(getNewCursorPosition("(202) 555-0123", "(202) 559-5012", 8)).toBe(8);
        });

        it("skips past a literal rather than landing inside it", () => {
            // Three digits entered; the caret must land after ")" and the space, not before them.
            expect(getNewCursorPosition("202", "(202) ", 3)).toBe(4);
        });

        it("returns 0 when no digits precede the caret", () => {
            expect(getNewCursorPosition("(202) 555-0123", "(202) 555-0123", 1)).toBe(0);
        });

        it("clamps to the end when the new value is shorter", () => {
            expect(getNewCursorPosition("(202) 555-0123", "(20", 12)).toBe(3);
        });
    });

    describe("capToMask", () => {
        it("stops at the mask's capacity", () => {
            expect(capToMask("12345678901234", "US")).toBe("1234567890");
        });

        it("strips mask characters before counting", () => {
            expect(capToMask("+1 (202) 555-0123", "US")).toBe("12025550123".slice(0, 10));
        });

        it("leaves countries without an authored mask alone", () => {
            // AF falls through to DEFAULT, which is a guess — capping on it would block valid input.
            expect(hasAuthoredMask("AF")).toBe(false);
            expect(capToMask("12345678901234", "AF")).toBe("12345678901234");
        });

        it("passes through anything already short enough", () => {
            expect(capToMask("202", "US")).toBe("202");
            expect(capToMask("", "US")).toBe("");
        });
    });

    describe("getCaretAfterEdit", () => {
        const US = getMaskForCountry("US");
        const collapsed = (at: number) => ({ start: at, end: at });

        it("advances past a digit typed at the end", () => {
            // "(123) 456" with the caret at the end, user types "7".
            expect(getCaretAfterEdit(9, collapsed(9), "(123) 4567", applyMask("1234567", US))).toBe(11);
        });

        it("advances past a digit inserted mid-string", () => {
            // "(1|23) 456", user types "9" — the caret belongs right after it.
            expect(getCaretAfterEdit(9, collapsed(2), "(19123) 456", applyMask("19123456", US))).toBe(4);
        });

        it("steps back over a backspace at the end", () => {
            expect(getCaretAfterEdit(9, collapsed(9), "(123) 45", applyMask("12345", US))).toBe(8);
        });

        it("stays where a selected range was when that range is deleted", () => {
            // "(123) [456]-7890" — deleting the selection must not drag the caret three characters
            // left, which is what tracking only the selection start used to do.
            expect(getCaretAfterEdit(14, { start: 6, end: 9 }, "(123) -7890", applyMask("1237890", US))).toBe(4);
        });

        it("lands after the replacement when the whole field is selected and retyped", () => {
            // Select-all then type "9". Tracking only the start put the caret at 0 — before the
            // opening "(" — so every following digit was inserted ahead of the last, reversing them.
            expect(getCaretAfterEdit(14, { start: 0, end: 14 }, "9", applyMask("9", US))).toBe(2);
        });

        it("never returns a negative offset", () => {
            expect(getCaretAfterEdit(14, collapsed(0), "", "")).toBe(0);
        });
    });
});
