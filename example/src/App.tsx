import PhoneInput from "@linhnguyen96114/react-native-phone-input";
import { useRef, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { PhoneInputRefType } from "../..";
import BasicExample from "./BasicExample";
import CustomStyledExample from "./CustomStyledExample";
import FormExample from "./FormExample";
import StyledExample from "./StyledExample";
import ValidationExample from "./ValidationExample";
import MaskingExample from "./MaskingExample";

type ExampleComponent = React.ReactNode;

const EXAMPLES: Array<{
    title: string;
    component: ExampleComponent;
    description: string;
    icon: string;
}> = [
    {
        title: "Basic Usage",
        component: <BasicExample />,
        description: "Simple phone input with default settings",
        icon: "📱"
    },
    {
        title: "Validation Example",
        component: <ValidationExample />,
        description: "Phone number validation with formatted output",
        icon: "✓"
    },
    {
        title: "Styled Example",
        component: <StyledExample />,
        description: "Custom styling with dark theme",
        icon: "🎨"
    },
    {
        title: "Custom Styled",
        component: <CustomStyledExample />,
        description: "Beautiful custom styled input with shadows",
        icon: "💅"
    },
    {
        title: "Form Integration",
        component: <FormExample />,
        description: "Example of phone input in a form with validation",
        icon: "📝"
    },
    {
        title: "Phone Number Masking",
        component: <MaskingExample />,
        description: "Auto-format phone numbers as you type with masking",
        icon: "🎭"
    }
];

const App = () => {
    const [selectedExample, setSelectedExample] = useState<number | null>(null);

    const [value, setValue] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [valid, setValid] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const phoneInput = useRef<PhoneInputRefType>(null);

    const renderExample = () => {
        if (selectedExample === null) {
            return (
                <ScrollView style={styles.exampleList} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.container}>
                        <SafeAreaView style={styles.wrapper}>
                            {showMessage && (
                                <View style={styles.message}>
                                    <View style={styles.messageRow}>
                                        <View style={styles.messageItem}>
                                            <Text style={styles.messageLabel}>Country Code</Text>
                                            <Text style={styles.messageValue}>{countryCode || "—"}</Text>
                                        </View>
                                        <View style={styles.messageItem}>
                                            <Text style={styles.messageLabel}>Phone Number</Text>
                                            <Text style={styles.messageValue}>{value || "—"}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.messageRow}>
                                        <View style={styles.messageItem}>
                                            <Text style={styles.messageLabel}>Formatted Number</Text>
                                            <Text style={styles.messageValue}>{formattedValue || "—"}</Text>
                                        </View>
                                        <View style={styles.messageItem}>
                                            <Text style={styles.messageLabel}>Valid</Text>
                                            <View
                                                style={[
                                                    styles.validationBadge,
                                                    valid ? styles.validBadge : styles.invalidBadge
                                                ]}>
                                                <Text style={styles.validationText}>
                                                    {valid ? "✓ Valid" : "✕ Invalid"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                            <PhoneInput
                                ref={phoneInput}
                                value={value}
                                defaultCode="IN"
                                layout="first"
                                onChangeText={(text) => {
                                    setValue(text);
                                }}
                                onChangeFormattedText={(text) => {
                                    setFormattedValue(text || "");
                                    setCountryCode(phoneInput.current?.getCountryCode() || "");
                                }}
                                disabled={disabled}
                                withDarkTheme
                                withShadow
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    const checkValid = phoneInput.current?.isValidNumber(value);
                                    setShowMessage(true);
                                    setValid(checkValid ? checkValid : false);
                                    setCountryCode(phoneInput.current?.getCountryCode() || "");
                                    let getNumberAfterPossiblyEliminatingZero =
                                        phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
                                    console.log(getNumberAfterPossiblyEliminatingZero);
                                }}>
                                <Text style={styles.buttonText}>Check</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, disabled ? {} : styles.redColor]}
                                onPress={() => {
                                    setDisabled(!disabled);
                                }}>
                                <Text style={styles.buttonText}>{disabled ? "Activate" : "Disable"}</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                    <Text style={styles.subtitle}>Select an example to see it in action</Text>
                    {EXAMPLES.map((example, index) => (
                        <TouchableOpacity
                            key={example.title}
                            style={styles.exampleButton}
                            onPress={() => setSelectedExample(index)}
                            activeOpacity={0.7}>
                            <View style={styles.exampleContent}>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>{example.icon}</Text>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.exampleTitle}>{example.title}</Text>
                                    <Text style={styles.exampleDescription}>{example.description}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            );
        }

        const Example = EXAMPLES[selectedExample]?.component;
        return (
            <View style={styles.exampleContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedExample(null)}
                    activeOpacity={0.7}>
                    <Text style={styles.backButtonText}>← Back to Examples</Text>
                </TouchableOpacity>
                {Example}
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {/* backgroundColor was removed in React Native 0.87, where Android draws
                    edge-to-edge and the bar is always transparent. */}
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Phone Input Examples</Text>
                    <Text style={styles.headerSubtitle}>React Native Phone Number Input Demo</Text>
                </View>
                {renderExample()}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6"
    },
    header: {
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef",
        alignItems: "center"
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#212529",
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6c757d"
    },
    subtitle: {
        fontSize: 16,
        color: "#6c757d",
        textAlign: "center",
        marginVertical: 20
    },
    exampleList: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 20
    },
    exampleButton: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    exampleContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f8f9fa",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16
    },
    icon: {
        fontSize: 24
    },
    textContainer: {
        flex: 1
    },
    exampleTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#212529",
        marginBottom: 4
    },
    exampleDescription: {
        fontSize: 14,
        color: "#6c757d",
        lineHeight: 20
    },
    exampleContainer: {
        flex: 1,
        backgroundColor: "#fff"
    },
    backButton: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef"
    },
    backButtonText: {
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "500"
    },
    button: {
        marginTop: 20,
        height: 50,
        width: 300,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#7CDB8A",
        shadowColor: "rgba(0,0,0,0.4)",
        shadowOffset: {
            width: 1,
            height: 5
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10
    },
    buttonText: {
        color: "white",
        fontSize: 14
    },
    redColor: {
        backgroundColor: "#F57777"
    },
    wrapper: {
        justifyContent: "center",
        alignItems: "center"
    },
    message: {
        borderWidth: 1,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    messageRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12
    },
    messageItem: {
        flex: 1,
        marginHorizontal: 8
    },
    messageLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 4,
        fontWeight: "500"
    },
    messageValue: {
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "600"
    },
    validationBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: "flex-start"
    },
    validBadge: {
        backgroundColor: "#DEF7EC"
    },
    invalidBadge: {
        backgroundColor: "#FDE8E8"
    },
    validationText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#03543F"
    }
});

export default App;
