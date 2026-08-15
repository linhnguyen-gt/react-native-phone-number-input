import PhoneInput, { type PhoneInputRefType } from "@linhnguyen96114/react-native-phone-input";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ValidationExample = () => {
    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState<string | undefined>(undefined);
    const [valid, setValid] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const phoneInput = useRef<PhoneInputRefType>(null);

    const checkValidation = async () => {
        setLoading(true);
        try {
            const isValid = phoneInput.current?.isValidNumber(value);
            setValid(isValid || false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Phone Validation</Text>
            <View style={styles.inputContainer}>
                <PhoneInput
                    ref={phoneInput}
                    value={value}
                    defaultCode="FR"
                    onChangeText={setValue}
                    onChangeFormattedText={setFormattedValue}
                    containerStyle={styles.phoneInput}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={checkValidation}
                disabled={loading || !value}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Validate Number</Text>}
            </TouchableOpacity>

            {valid !== null && (
                <View style={styles.resultContainer}>
                    <Text style={[styles.status, valid ? styles.valid : styles.invalid]}>
                        {valid ? "✓ Valid Number" : "✕ Invalid Number"}
                    </Text>
                    <Text style={styles.formattedValue}>Formatted: {formattedValue}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
        marginBottom: 30,
        textAlign: "center"
    },
    inputContainer: {
        alignItems: "center",
        marginBottom: 20
    },
    phoneInput: {
        width: "100%",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    button: {
        height: 50,
        backgroundColor: "#7C4DFF",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    resultContainer: {
        marginTop: 30,
        alignItems: "center"
    },
    status: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10
    },
    valid: {
        color: "#4CAF50"
    },
    invalid: {
        color: "#F44336"
    },
    formattedValue: {
        fontSize: 16,
        color: "#666"
    }
});

export default ValidationExample;
