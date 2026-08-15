import * as React from "react";
import { type ViewProps, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    fullWidth: {
        width: "100%",
        justifyContent: "space-between",
        padding: 10,
        paddingHorizontal: 50
    }
});

type RowProps = ViewProps & { children?: React.ReactNode; fullWidth?: boolean };

export const Row = (props: RowProps) => (
    <View {...props} style={[styles.row, props.style, props.fullWidth && styles.fullWidth]} />
);
