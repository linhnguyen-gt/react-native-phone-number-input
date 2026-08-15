import { type ReactNode } from "react";
import {
    StyleSheet,
    View,
    type ImageSourcePropType,
    type ImageStyle,
    type StyleProp,
    type ViewStyle
} from "react-native";
import CloseButton from "./CloseButton";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center"
    }
});

interface HeaderModalProps {
    withFilter?: boolean;
    withCloseButton?: boolean;
    closeButtonImage?: ImageSourcePropType;
    closeButtonStyle?: StyleProp<ViewStyle>;
    closeButtonImageStyle?: StyleProp<ImageStyle>;
    onClose(): void;
    renderFilter(props: HeaderModalProps): ReactNode;
}
export const HeaderModal = ({
    withFilter,
    withCloseButton = true,
    closeButtonImage,
    closeButtonStyle,
    closeButtonImageStyle,
    onClose,
    renderFilter
}: HeaderModalProps) => {
    return (
        <View style={styles.container}>
            {withCloseButton && (
                <CloseButton
                    image={closeButtonImage}
                    style={closeButtonStyle}
                    imageStyle={closeButtonImageStyle}
                    onPress={() => onClose()}
                />
            )}
            {withFilter &&
                renderFilter({
                    withFilter,
                    withCloseButton,
                    closeButtonImage,
                    closeButtonStyle,
                    closeButtonImageStyle,
                    onClose,
                    renderFilter
                })}
        </View>
    );
};
