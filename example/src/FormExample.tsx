import PhoneInput from "@linhnguyen96114/react-native-phone-input";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FormExample = () => {
    const [phone, setPhone] = useState("");
    const [formattedPhone, setFormattedPhone] = useState<string | undefined>(undefined);
    const [isValid, setIsValid] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!phone) {
            Alert.alert("Error", "Please enter a phone number");
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            Alert.alert("Success", `Phone number submitted: ${formattedPhone}`);
        } catch {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Contact Form</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Phone Number *</Text>
                <PhoneInput
                    defaultValue={phone}
                    defaultCode="US"
                    onChangeText={(text) => {
                        setPhone(text);
                        setIsValid(text.length >= 10);
                    }}
                    onChangeFormattedText={setFormattedPhone}
                    containerStyle={styles.phoneContainer}
                    textContainerStyle={styles.textInput}
                    textInputStyle={[styles.input, !isValid && styles.inputError]}
                    autoFocus
                />
                {!isValid && <Text style={styles.errorText}>Please enter a valid phone number</Text>}

                <TouchableOpacity
                    style={[styles.submitButton, (!isValid || loading) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!isValid || loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
                </TouchableOpacity>
            </View>
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
        color: "#1a1a1a",
        marginBottom: 30,
        textAlign: "center"
    },
    form: {
        width: "100%"
    },
    label: {
        fontSize: 16,
        color: "#333",
        marginBottom: 8,
        fontWeight: "500"
    },
    phoneContainer: {
        width: "100%",
        borderRadius: 8,
        backgroundColor: "#f8f9fa",
        borderWidth: 1,
        borderColor: "#dee2e6"
    },
    textInput: {
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        paddingHorizontal: 15
    },
    input: {
        fontSize: 16,
        color: "#495057"
    },
    inputError: {
        color: "#dc3545"
    },
    errorText: {
        color: "#dc3545",
        fontSize: 14,
        marginTop: 5
    },
    submitButton: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center"
    },
    submitButtonDisabled: {
        backgroundColor: "#6c757d",
        opacity: 0.65
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});

export default FormExample;
