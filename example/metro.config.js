const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const pkg = require("../package.json");

const root = path.resolve(__dirname, "..");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    watchFolders: [root],
    resolver: {
        resolverMainFields: ["source", "react-native", "browser", "main"],
        extraNodeModules: {
            [pkg.name]: root,
            react: path.join(root, "node_modules/react"),
            "react-native": path.join(root, "node_modules/react-native"),
            "react-native-safe-area-context": path.join(root, "node_modules/react-native-safe-area-context")
        }
    }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
