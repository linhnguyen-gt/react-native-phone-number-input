import * as React from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const duration = 300;
const useNativeDriver = true;

const styles = StyleSheet.create({
    // Spelled out rather than spreading StyleSheet.absoluteFillObject, which React Native 0.87
    // removed, or absoluteFill, which is a registered style id on older versions this package
    // still supports.
    absolute: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 99,
        elevation: 99
    }
});

interface Props {
    visible?: boolean;
    children: React.ReactNode;
}

const AnimatedModal: React.FC<Props> = ({ children, visible = false }) => {
    const translateY = new Animated.Value(height);

    const showModal = Animated.timing(translateY, {
        toValue: 0,
        duration,
        useNativeDriver
    }).start;

    const hideModal = Animated.timing(translateY, {
        toValue: height,
        duration,
        useNativeDriver
    }).start;

    React.useEffect(() => {
        if (visible) {
            showModal();
        } else {
            hideModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return <Animated.View style={[styles.absolute, { transform: [{ translateY }] }]}>{children}</Animated.View>;
};

export default AnimatedModal;
