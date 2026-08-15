import { StyleSheet } from "react-native";

// The widths these styles used to carry were a percentage of the window resolved once, at import
// time, and frozen into the stylesheet. On any screen that is not the one the module happened to
// load on — after a rotation, on a foldable, in a resizable window — the input kept a width
// derived from the old screen: 80% of a portrait phone is barely a third of the same device in
// landscape. They are computed per render in `useResponsiveWidths` instead.
const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flexDirection: "row"
    },
    flagButtonView: {
        height: 50,
        minWidth: 32,
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center"
    },
    shadow: {
        shadowColor: "rgba(0,0,0,0.4)",
        shadowOffset: {
            width: 1,
            height: 5
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10
    },
    dropDownImage: {
        height: 14,
        width: 12
    },
    textContainer: {
        flex: 1,
        textAlign: "left",
        flexDirection: "row",
        alignItems: "center"
    },
    codeText: {
        fontSize: 16,
        marginRight: 10,
        fontWeight: "500",
        color: "#000000"
    },
    numberText: {
        fontSize: 16,
        color: "#000000",
        flex: 1
    }
});

export default styles;
