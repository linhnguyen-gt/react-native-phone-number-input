import PhoneInput from "@linhnguyen96114/react-native-phone-input";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const CustomStyledExample = () => {
    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState<string | undefined>(undefined);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Custom Styled Input</Text>
            <View style={styles.inputContainer}>
                <PhoneInput
                    value={value}
                    defaultCode="US"
                    onChangeText={setValue}
                    onChangeFormattedText={setFormattedValue}
                    containerStyle={styles.phoneContainer}
                    textContainerStyle={styles.textInput}
                    flagButtonStyle={styles.flagButton}
                    textInputStyle={styles.input}
                    codeTextStyle={styles.codeText}
                    placeholder="Enter phone number"
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
        backgroundColor: "#F0F8FF"
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#2C3E50",
        marginBottom: 30,
        textAlign: "center"
    },
    inputContainer: {
        alignItems: "center"
    },
    phoneContainer: {
        width: "100%",
        borderRadius: 30,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    textInput: {
        borderRadius: 30,
        backgroundColor: "#fff",
        paddingHorizontal: 15
    },
    input: {
        fontSize: 16,
        color: "#2C3E50"
    },
    flagButton: {
        borderRadius: 30,
        backgroundColor: "#fff",
        paddingHorizontal: 10
    },
    codeText: {
        fontSize: 16,
        color: "#2C3E50",
        fontWeight: "600"
    },
    formattedNumber: {
        fontSize: 16,
        color: "#34495E",
        textAlign: "center",
        marginTop: 20,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10
    }
});

export default CustomStyledExample;
