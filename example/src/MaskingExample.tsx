import PhoneInput, { type PhoneInputRefType } from "@linhnguyen96114/react-native-phone-input";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const MaskingExample = () => {
    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState<string | undefined>(undefined);
    const [maskedValue, setMaskedValue] = useState("");
    const [maskedFormattedValue, setMaskedFormattedValue] = useState<string | undefined>(undefined);
    const phoneInput = useRef<PhoneInputRefType>(null);
    const maskedPhoneInput = useRef<PhoneInputRefType>(null);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.mainTitle}>Phone Number Masking</Text>
            <Text style={styles.subtitle}>Compare masked vs unmasked input behavior</Text>

            {/* Without Masking */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Without Masking</Text>
                <Text style={styles.description}>Standard input - shows exactly what you type</Text>

                <View style={styles.inputContainer}>
                    <PhoneInput
                        ref={phoneInput}
                        value={value}
                        defaultCode="US"
                        onChangeText={setValue}
                        onChangeFormattedText={setFormattedValue}
                        containerStyle={styles.phoneInput}
                        textContainerStyle={styles.textContainer}
                        withShadow
                    />
                </View>

                <View style={styles.outputBox}>
                    <Text style={styles.label}>Raw Value:</Text>
                    <Text style={styles.value}>{value || "(empty)"}</Text>

                    <Text style={[styles.label, styles.labelSpacing]}>Formatted Value:</Text>
                    <Text style={styles.value}>{formattedValue || "(empty)"}</Text>
                </View>
            </View>

            {/* With Masking */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>With Masking</Text>
                <Text style={styles.description}>Auto-formats as you type based on country</Text>

                <View style={styles.inputContainer}>
                    <PhoneInput
                        ref={maskedPhoneInput}
                        value={maskedValue}
                        defaultCode="US"
                        onChangeText={setMaskedValue}
                        onChangeFormattedText={setMaskedFormattedValue}
                        containerStyle={styles.phoneInput}
                        textContainerStyle={styles.textContainer}
                        withMask
                        withShadow
                    />
                </View>

                <View style={styles.outputBox}>
                    <Text style={styles.label}>Raw Value (digits only):</Text>
                    <Text style={styles.value}>{maskedValue || "(empty)"}</Text>

                    <Text style={[styles.label, styles.labelSpacing]}>Formatted Value:</Text>
                    <Text style={styles.value}>{maskedFormattedValue || "(empty)"}</Text>
                </View>
            </View>

            {/* Formatting Examples */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Formatting Examples by Country</Text>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇺🇸 US:</Text>
                    <Text style={styles.exampleFormat}>(123) 456-7890</Text>
                </View>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇻🇳 VN:</Text>
                    <Text style={styles.exampleFormat}>012 345 6789</Text>
                </View>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇬🇧 GB:</Text>
                    <Text style={styles.exampleFormat}>07700 900123</Text>
                </View>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇫🇷 FR:</Text>
                    <Text style={styles.exampleFormat}>06 12 34 56 78</Text>
                </View>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇩🇪 DE:</Text>
                    <Text style={styles.exampleFormat}>0151 12345678</Text>
                </View>

                <View style={styles.exampleRow}>
                    <Text style={styles.countryCode}>🇯🇵 JP:</Text>
                    <Text style={styles.exampleFormat}>090-1234-5678</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>💡 How it works:</Text>
                <Text style={styles.infoText}>
                    • Display shows formatted number with mask{"\n"}• onChangeText receives digits only{"\n"}•
                    onChangeFormattedText receives full number with country code{"\n"}• Mask pattern updates when you
                    change country{"\n"}• Works with paste, delete, and all text operations
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
        textAlign: "center"
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center"
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16
    },
    inputContainer: {
        marginBottom: 16
    },
    phoneInput: {
        width: "100%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#dee2e6"
    },
    textContainer: {
        borderRadius: 8,
        backgroundColor: "#fff"
    },
    outputBox: {
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e9ecef"
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6c757d",
        marginBottom: 4
    },
    labelSpacing: {
        marginTop: 12
    },
    value: {
        fontSize: 16,
        color: "#212529",
        fontFamily: "monospace"
    },
    exampleRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    countryCode: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        width: 80
    },
    exampleFormat: {
        fontSize: 16,
        color: "#666",
        fontFamily: "monospace"
    },
    infoBox: {
        backgroundColor: "#e7f3ff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#b3d9ff"
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0056b3",
        marginBottom: 8
    },
    infoText: {
        fontSize: 14,
        color: "#004085",
        lineHeight: 22
    }
});

export default MaskingExample;
