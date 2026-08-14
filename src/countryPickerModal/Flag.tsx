import { memo } from "react";
import { useAsync } from "react-async-hook";
import { ActivityIndicator, Image, PixelRatio, StyleSheet, Text, View } from "react-native";
import { useContext } from "./CountryContext";
import { Emoji } from "./Emoji";
import { type CountryCode } from "./types";

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        marginRight: 10
    },
    emojiFlag: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1 / PixelRatio.get(),
        borderColor: "transparent",
        backgroundColor: "transparent"
    },
    imageFlag: {
        resizeMode: "contain",
        width: 25,
        height: 19,
        borderWidth: 1 / PixelRatio.get(),
        opacity: 0.8
    }
});

interface FlagType {
    countryCode: CountryCode;
    withEmoji?: boolean;
    withFlagButton?: boolean;
    flagSize: number;
}

const ImageFlag: React.FC<FlagType> = memo(({ countryCode, flagSize }) => {
    const { getImageFlagAsync } = useContext();
    const asyncResult = useAsync(getImageFlagAsync, [countryCode]);
    if (asyncResult.loading) {
        return <ActivityIndicator size={"small"} />;
    }
    return (
        <Image
            resizeMode={"contain"}
            style={[
                styles.imageFlag,
                // eslint-disable-next-line react-native/no-inline-styles
                { borderColor: "transparent", height: flagSize }
            ]}
            source={{ uri: asyncResult.result }}
        />
    );
});

const EmojiFlag: React.FC<FlagType> = memo(({ countryCode, flagSize }) => {
    // Synchronous: the emoji data set is bundled. This used to be a `useAsync` per row, which
    // paid for a spinner and a second render 250 times over while scrolling.
    const { getEmojiFlag } = useContext();

    return (
        <Text style={[styles.emojiFlag, { fontSize: flagSize }]} allowFontScaling={false}>
            <Emoji {...{ name: getEmojiFlag(countryCode) }} />
        </Text>
    );
});

export const Flag: React.FC<FlagType> = ({ countryCode, withEmoji = true, withFlagButton = true, flagSize }) =>
    withFlagButton ? (
        <View style={styles.container}>
            {withEmoji ? <EmojiFlag {...{ countryCode, flagSize }} /> : <ImageFlag {...{ countryCode, flagSize }} />}
        </View>
    ) : null;
