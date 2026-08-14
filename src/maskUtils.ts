import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

import type { CountryCode } from "./countryPickerModal";

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Phone number mask patterns for different countries
 * '#' represents a digit placeholder
 * Other characters are literals that will appear in the formatted output
 *
 * Typed against `CountryCode` so a typo is a compile error, with `DEFAULT` required so the
 * fallback lookup needs no cast.
 */
export const MASK_PATTERNS: Partial<Record<CountryCode, string>> & { DEFAULT: string } = {
    // North America
    US: "(###) ###-####", // United States: (123) 456-7890
    CA: "(###) ###-####", // Canada: (123) 456-7890

    // Asia-Pacific
    VN: "### ### ####", // Vietnam: 012 345 6789
    AU: "#### ### ###", // Australia: 0412 345 678
    JP: "###-####-####", // Japan: 090-1234-5678
    CN: "### #### ####", // China: 138 0013 8000
    IN: "##### #####", // India: 98765 43210
    SG: "#### ####", // Singapore: 9123 4567
    KR: "###-####-####", // South Korea: 010-1234-5678
    TH: "###-###-####", // Thailand: 081-234-5678

    // Europe
    GB: "##### ######", // United Kingdom: 07700 900123
    FR: "## ## ## ## ##", // France: 06 12 34 56 78
    DE: "#### ########", // Germany: 0151 12345678
    IT: "### ### ####", // Italy: 320 123 4567
    ES: "### ## ## ##", // Spain: 612 34 56 78
    NL: "## ########", // Netherlands: 06 12345678
    BE: "#### ## ## ##", // Belgium: 0470 12 34 56
    CH: "### ### ## ##", // Switzerland: 079 123 45 67

    // Middle East
    AE: "## ### ####", // UAE: 50 123 4567
    SA: "## ### ####", // Saudi Arabia: 50 123 4567

    // Latin America
    BR: "(##) #####-####", // Brazil: (11) 91234-5678
    MX: "### ### ####", // Mexico: 222 123 4567
    AR: "## ####-####", // Argentina: 11 1234-5678

    // Africa
    ZA: "### ### ####", // South Africa: 082 123 4567
    NG: "### ### ####", // Nigeria: 080 123 4567

    // Generic fallback for countries not listed
    DEFAULT: "### ### ### ###"
};

/**
 * Get the mask pattern for a specific country code
 * @param countryCode - The ISO 3166-1 alpha-2 country code
 * @returns The mask pattern string for the country
 */
export function getMaskForCountry(countryCode: CountryCode): string {
    return MASK_PATTERNS[countryCode] ?? MASK_PATTERNS.DEFAULT;
}

/**
 * True when this country has a hand-authored mask rather than falling through to `DEFAULT`.
 *
 * Only ~26 of ~250 countries do. `DEFAULT` is a guess at the shape of a number, so a length cap
 * derived from it would block legitimate input rather than merely mis-space it — which is why
 * the cap applies here and nowhere else.
 */
export function hasAuthoredMask(countryCode: CountryCode): boolean {
    return MASK_PATTERNS[countryCode] !== undefined;
}

/**
 * Remove all non-digit characters from a string
 * @param value - The string to clean
 * @returns String containing only digits
 */
export function removeMask(value: string): string {
    return value.replace(/\D/g, "");
}

/**
 * Apply a mask pattern to a phone number
 * @param value - The raw phone number (digits only or with formatting)
 * @param mask - The mask pattern to apply
 * @returns The formatted phone number with mask applied
 */
export function applyMask(value: string, mask: string): string {
    // Remove all non-digit characters from input
    const digits = removeMask(value);

    if (!digits) {
        return "";
    }

    let result = "";
    let digitIndex = 0;

    // Iterate through mask pattern
    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
        if (mask[i] === "#") {
            // Replace '#' with actual digit
            result += digits[digitIndex];
            digitIndex++;
        } else {
            // Add literal character from mask
            result += mask[i];
        }
    }

    // If there are remaining digits that don't fit the mask, append them
    if (digitIndex < digits.length) {
        result += digits.slice(digitIndex);
    }

    return result;
}

/**
 * Where the caret belongs in a freshly masked string.
 *
 * Anchored on digits, not characters: the caret keeps the same number of digits in front of it
 * that the user had before the mask was reapplied, so inserting a digit mid-string does not
 * throw the caret to the end and does not land it inside a literal.
 *
 * @param previousValue - The string the user was editing, mask characters included
 * @param newValue - The re-masked string
 * @param previousCursorPosition - The caret offset within `previousValue`
 * @returns The caret offset within `newValue`
 */
export function getNewCursorPosition(previousValue: string, newValue: string, previousCursorPosition: number): number {
    const digitsBefore = removeMask(previousValue.slice(0, previousCursorPosition)).length;

    if (digitsBefore === 0) {
        return 0;
    }

    let digitsCount = 0;
    for (let i = 0; i < newValue.length; i++) {
        const char = newValue[i];
        if (char && /\d/.test(char)) {
            digitsCount++;
            if (digitsCount === digitsBefore) {
                return i + 1;
            }
        }
    }

    return newValue.length;
}

/**
 * Get the maximum number of digits allowed by a mask pattern
 * @param mask - The mask pattern
 * @returns The count of '#' characters in the mask
 */
export function getMaxDigits(mask: string): number {
    return (mask.match(/#/g) || []).length;
}

/**
 * Format a national number as E.164.
 *
 * Delegates the trunk-prefix rule to libphonenumber rather than stripping a leading zero by
 * hand, because that rule is regional: `0612345678` in Italy is `+390612345678` — the zero is
 * part of the number — while the same digits in Vietnam are `+84912345678`. Both are verified
 * in `maskUtils.test.ts`. A blanket strip produces an invalid Italian number.
 *
 * This is formatting, not validation. A string coming out of here is not evidence that the
 * number exists or can receive calls; use `isValidNumber` for that, and even then not as an
 * authorization decision.
 *
 * @param rawDigits - The number as entered, national format, no mask characters required
 * @param countryCode - The selected region, used to resolve the trunk prefix
 * @param callingCode - Used only for the fallback, when the number cannot yet be parsed
 * @returns An E.164 string, a best-effort `+<callingCode><digits>` join, or `""` when empty
 */
export function toE164(rawDigits: string, countryCode: CountryCode, callingCode?: string): string {
    const digits = removeMask(rawDigits);
    if (!digits) {
        return "";
    }
    try {
        return phoneUtil.format(phoneUtil.parse(digits, countryCode), PhoneNumberFormat.E164);
    } catch {
        // Partially typed numbers do not parse. Joining is what this component always did, and
        // it keeps `onChangeFormattedText` useful on every keystroke rather than only the last.
        return callingCode ? `+${callingCode}${digits}` : digits;
    }
}
