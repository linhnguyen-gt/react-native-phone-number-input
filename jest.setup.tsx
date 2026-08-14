/**
 * Jest environment for the library.
 *
 * Two things have to be true before any component test can run:
 *
 * 1. `react-native-safe-area-context` must yield its children. `CountryModal` constructs its
 *    own `SafeAreaProvider` with no `initialMetrics`, and the real provider renders `null`
 *    until an `onLayout` supplies insets — which never fires under jest. The provider is
 *    internal to the modal, so no consumer can inject metrics; mocking the module is the only
 *    lever available.
 * 2. No test may reach the network. `CountryService` calls `fetch` unconditionally in FLAT
 *    flag mode against a third-party host, so an unguarded suite would make CI depend on, and
 *    be observable to, that host.
 *
 * The mock factory requires its dependencies inline: jest hoists `jest.mock` above the
 * imports, so a module-scope `React` binding is not initialised when the factory runs.
 */

jest.mock("react-native-safe-area-context", () => {
    const React = require("react");
    const { View } = require("react-native");

    const insets = { top: 0, right: 0, bottom: 0, left: 0 };
    const frame = { x: 0, y: 0, width: 390, height: 844 };

    const passThrough = (name: string) => {
        const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
            React.createElement(View, props, children);
        Component.displayName = name;
        return Component;
    };

    return {
        SafeAreaProvider: passThrough("SafeAreaProvider"),
        SafeAreaView: passThrough("SafeAreaView"),
        SafeAreaInsetsContext: React.createContext(insets),
        SafeAreaFrameContext: React.createContext(frame),
        useSafeAreaInsets: () => insets,
        useSafeAreaFrame: () => frame,
        initialWindowMetrics: { insets, frame }
    };
});

beforeEach(() => {
    // A test that needs remote country data must mock this deliberately, per test.
    global.fetch = jest.fn(() => {
        throw new Error("Network access is disabled in tests. Mock fetch in the test that needs it.");
    }) as unknown as typeof fetch;
});
