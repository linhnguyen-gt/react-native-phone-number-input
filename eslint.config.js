const reactNativeConfig = require("@react-native/eslint-config/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

const prettierOptions = require("./package.json").prettier;

module.exports = [
    {
        ignores: ["node_modules/**", "lib/**", "example/android/**", "example/ios/**"]
    },
    ...reactNativeConfig,
    prettierRecommended,
    {
        rules: {
            "react/react-in-jsx-scope": "off",
            "prettier/prettier": ["error", prettierOptions]
        }
    }
];
