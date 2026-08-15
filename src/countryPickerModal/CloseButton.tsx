import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    TouchableOpacity,
    View,
    type ImageSourcePropType,
    type ImageStyle,
    type StyleProp,
    type TextStyle,
    type ViewStyle
} from "react-native";
import { useTheme } from "./CountryTheme";

const styles = StyleSheet.create({
    container: {
        height: 50,
        width: "12%",
        alignItems: "center",
        justifyContent: "center"
    },
    imageStyle: {
        height: 35,
        width: 35,
        resizeMode: "contain"
    },
    iconStyle: {
        fontSize: 28,
        lineHeight: 30,
        textAlign: "center"
    }
});

interface CloseButtonProps {
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    image?: ImageSourcePropType;
    onPress?(): void;
}

const CloseButtonAndroid = (props: CloseButtonProps) => {
    const { onBackgroundTextColor } = useTheme();
    return (
        <View style={[styles.container, props.style]}>
            <TouchableNativeFeedback onPress={props.onPress}>
                <View>
                    {props.image ? (
                        <Image
                            tintColor={onBackgroundTextColor}
                            source={props.image}
                            style={[styles.imageStyle, props.imageStyle]}
                        />
                    ) : (
                        <Text
                            style={[
                                styles.iconStyle,
                                { color: onBackgroundTextColor },
                                props.imageStyle as StyleProp<TextStyle>
                            ]}>
                            ×
                        </Text>
                    )}
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const CloseButtonIOS = (props: CloseButtonProps) => {
    const { onBackgroundTextColor } = useTheme();
    return (
        <View style={[styles.container, props.style]}>
            <TouchableOpacity onPress={props.onPress}>
                {props.image ? (
                    <Image
                        source={props.image}
                        style={[styles.imageStyle, props.imageStyle, { tintColor: onBackgroundTextColor }]}
                    />
                ) : (
                    <Text
                        style={[
                            styles.iconStyle,
                            { color: onBackgroundTextColor },
                            props.imageStyle as StyleProp<TextStyle>
                        ]}>
                        ×
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default Platform.select({
    ios: CloseButtonIOS,
    android: CloseButtonAndroid,
    web: CloseButtonIOS,
    default: CloseButtonIOS
});
