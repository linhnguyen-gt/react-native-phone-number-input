// Hand-written to type `styles.js`. Keep the two in step — nothing checks that they agree, so a
// key that lingers here after being dropped from the stylesheet type-checks and then reads
// `undefined` at runtime.
declare const styles: {
    container: {
        backgroundColor: string;
        flexDirection: "row";
    };
    flagButtonView: {
        height: number;
        minWidth: number;
        justifyContent: "center";
        flexDirection: "row";
        alignItems: "center";
    };
    shadow: {
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    dropDownImage: {
        height: number;
        width: number;
    };
    textContainer: {
        flex: number;
        textAlign: "left";
        flexDirection: "row";
        alignItems: "center";
    };
    codeText: {
        fontSize: number;
        marginRight: number;
        fontWeight: "500";
        color: string;
    };
    numberText: {
        fontSize: number;
        color: string;
        flex: number;
    };
};
export default styles;
