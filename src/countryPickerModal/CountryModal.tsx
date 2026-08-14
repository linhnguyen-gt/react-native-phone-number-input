import * as React from "react";
import { Modal, type ModalProps, Platform, StyleSheet } from "react-native";
import { type Edge, SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AnimatedModal from "./AnimatedModal";
import { CountryModalContext } from "./CountryModalProvider";
import { useTheme } from "./CountryTheme";

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

const CountryModal = ({
    animationType = "slide",
    modalSafeAreaEdges,
    withModal = true,
    disableNativeModal = false,
    children,
    ...props
}: ModalProps & {
    children: React.ReactNode;
    withModal?: boolean;
    modalSafeAreaEdges?: Edge[];
    disableNativeModal?: boolean;
}) => {
    const { backgroundColor } = useTheme();
    const { teleport } = React.useContext(CountryModalContext);
    const content = (
        <SafeAreaProvider>
            <SafeAreaView edges={modalSafeAreaEdges} style={[styles.container, { backgroundColor }]}>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    );
    React.useEffect(() => {
        if (disableNativeModal) {
            teleport!(<AnimatedModal {...props}>{content}</AnimatedModal>);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disableNativeModal]);
    if (withModal) {
        if (Platform.OS === "web") {
            return (
                <Modal animationType={animationType} {...props}>
                    {content}
                </Modal>
            );
        }
        if (disableNativeModal) {
            return null;
        }
        return (
            <Modal animationType={animationType} {...props}>
                {content}
            </Modal>
        );
    }
    return content;
};

export default CountryModal;
