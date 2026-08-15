import PhoneInput from "@linhnguyen96114/react-native-phone-input";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const BasicExample = () => {
    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState<string | undefined>(undefined);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Basic Phone Input</Text>
            <View style={styles.inputContainer}>
                <PhoneInput
                    value={value}
                    defaultCode="US"
                    onChangeText={setValue}
                    onChangeFormattedText={setFormattedValue}
                    withShadow
                    autoFocus
                    containerStyle={styles.phoneInput}
                />
            </View>
            {formattedValue ? <Text style={styles.formattedNumber}>Formatted: {formattedValue}</Text> : null}
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
    formattedNumber: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginTop: 20
    }
});

export default BasicExample;
