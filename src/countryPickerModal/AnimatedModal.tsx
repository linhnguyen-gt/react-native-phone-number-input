import * as React from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";

const duration = 300;
const useNativeDriver = true;

const styles = StyleSheet.create({
    // Spelled out rather than spreading StyleSheet.absoluteFillObject, which React Native 0.87
    // removed, or absoluteFill, which is a registered style id rather than an object.
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

const AnimatedModal = ({ children, visible = false }: Props) => {
    // Read through a hook rather than once at module scope: the closed position is one screen
    // height down, so a value captured at import time is wrong for the rest of the session after
    // the first rotation. Landscape-at-launch then rotate to portrait left the modal parked
    // mid-screen while closed, because it had only ever been pushed down by the landscape height.
    const { height } = useWindowDimensions();

    // The value has to survive re-renders. It was previously constructed inline, so every render
    // produced a fresh one sitting at `height` — off-screen — while the animation that had been
    // started kept running against the discarded value. Any re-render during or after the open
    // animation therefore snapped the modal back out of view, and with `useNativeDriver` the
    // native node was re-attached each time, so the next open animated a value the view no longer
    // used.
    const translateY = React.useRef(new Animated.Value(height)).current;
    const wasVisible = React.useRef(visible);

    React.useEffect(() => {
        const visibilityChanged = wasVisible.current !== visible;
        wasVisible.current = visible;

        // A closed modal follows the new screen height immediately. Animating that would slide it
        // down the full screen in plain view, which is the rotation glitch rather than the fix.
        if (!visible && !visibilityChanged) {
            translateY.setValue(height);
            return;
        }

        const animation = Animated.timing(translateY, {
            toValue: visible ? 0 : height,
            duration,
            useNativeDriver
        });
        animation.start();

        // Reversing mid-flight leaves the previous animation running against the same value,
        // which fights the new one for the last frame.
        return () => animation.stop();
    }, [translateY, visible, height]);

    return <Animated.View style={[styles.absolute, { transform: [{ translateY }] }]}>{children}</Animated.View>;
};

export default AnimatedModal;
