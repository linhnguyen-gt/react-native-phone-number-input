import PhoneInput from "@linhnguyen96114/react-native-phone-input";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const StyledExample = () => {
    const [value, setValue] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dark Theme</Text>
            <View style={styles.inputContainer}>
                <PhoneInput
                    value={value}
                    defaultCode="GB"
                    onChangeText={setValue}
                    withDarkTheme
                    containerStyle={styles.phoneContainer}
                    textContainerStyle={styles.textInput}
                    codeTextStyle={styles.codeText}
                    textInputStyle={styles.input}
                    flagButtonStyle={styles.flagButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#1A1A1A"
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 30,
        textAlign: "center"
    },
    inputContainer: {
        alignItems: "center"
    },
    phoneContainer: {
        width: "100%",
        borderRadius: 12,
        backgroundColor: "#2A2A2A",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#333"
    },
    textInput: {
        backgroundColor: "#2A2A2A",
        paddingHorizontal: 15,
        borderLeftWidth: 1,
        borderLeftColor: "#333"
    },
    input: {
        color: "#fff",
        fontSize: 16
    },
    flagButton: {
        backgroundColor: "#2A2A2A",
        paddingHorizontal: 10
    },
    codeText: {
        color: "#fff",
        fontWeight: "600"
    }
});

export default StyledExample;
