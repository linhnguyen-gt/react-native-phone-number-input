/**
 * The one place that knows about `@testing-library/react-native` 14's async API.
 *
 * In RNTL 14 `render`, `rerender`, `fireEvent` and `unmount` all return promises. Calling one
 * without awaiting it silently reads pre-update state, which reads as a passing test asserting
 * the wrong value. Every helper here awaits, and every getter re-queries rather than holding a
 * node captured before the last event.
 *
 * Lives outside `__tests__/` on purpose: jest's `testMatch` collects that directory, and a
 * helper module there fails the run with "Your test suite must contain at least one test".
 */
import { fireEvent, render, type RenderResult } from "@testing-library/react-native";
import * as React from "react";

import PhoneInput, { type PhoneInputProps, type PhoneInputRefType } from "../index";

export const TEST_IDS = {
    text: "phone-input-text",
    countryButton: "phone-input-country-button",
    callingCode: "phone-input-calling-code",
    countryRow: (cca2: string) => `country-selector-${cca2}`,
    countryList: "list-countries"
} as const;

export type PhoneInputHarness = {
    view: RenderResult;
    ref: React.RefObject<PhoneInputRefType | null>;
    /** Current string the TextInput is displaying. Re-queried on every call. */
    displayedValue: () => string;
    type: (text: string) => Promise<void>;
    clear: () => Promise<void>;
    openPicker: () => Promise<void>;
    selectCountry: (cca2: string) => Promise<void>;
    callingCode: () => string | undefined;
    setProps: (next: Partial<PhoneInputProps>) => Promise<void>;
};

export const renderPhoneInput = async (props: PhoneInputProps = {}): Promise<PhoneInputHarness> => {
    const ref = React.createRef<PhoneInputRefType>();
    let current: PhoneInputProps = props;

    const view = await render(<PhoneInput ref={ref} {...current} />);

    const input = () => view.getByTestId(TEST_IDS.text);

    return {
        view,
        ref,
        displayedValue: () => input().props.value ?? "",
        type: async (text: string) => {
            await fireEvent.changeText(input(), text);
        },
        clear: async () => {
            await fireEvent.changeText(input(), "");
        },
        openPicker: async () => {
            await fireEvent.press(view.getByTestId(TEST_IDS.countryButton));
            await view.findByTestId(TEST_IDS.countryList);
        },
        selectCountry: async (cca2: string) => {
            await fireEvent.press(await view.findByTestId(TEST_IDS.countryRow(cca2)));
        },
        callingCode: () => view.queryByTestId(TEST_IDS.callingCode)?.props.children,
        setProps: async (next: Partial<PhoneInputProps>) => {
            current = { ...current, ...next };
            await view.rerender(<PhoneInput ref={ref} {...current} />);
        }
    };
};
