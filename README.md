<div align="center">
  <h1>📱 React Native Phone Number Input</h1>
  <p><strong>A powerful, customizable phone input component for React Native</strong></p>

  <div>
    <img src="image/Phone_Number_Input_Layout_1.gif" height="400" style="margin: 0 10px; border-radius: 10px; box-shadow: 0 20px 30px 3px rgba(9, 9, 16, 0.2);">
    <img src="image/Phone_Number_Input_Layout_2.gif" height="400" style="margin: 0 10px; border-radius: 10px; box-shadow: 0 20px 30px 3px rgba(9, 9, 16, 0.2);">
  </div>
  <p>
    <a href="https://www.npmjs.com/package/@linhnguyen96114/react-native-phone-input">
      <img src="https://img.shields.io/npm/v/@linhnguyen96114/react-native-phone-input.svg" alt="npm version">
    </a>
    <a href="https://www.npmjs.com/package/@linhnguyen96114/react-native-phone-input">
      <img src="https://img.shields.io/npm/dm/%40linhnguyen96114%2Freact-native-phone-input.svg" alt="npm downloads per month">
    </a>
    <a href="https://github.com/linhnguyen-gt/react-native-phone-number-input/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/linhnguyen-gt/react-native-phone-number-input.svg" alt="license">
    </a>
  </p>
</div>

## ✨ Features

-   📱 Cross-platform support (iOS & Android)
-   🎨 Highly customizable UI
-   🔍 Built-in country search
-   ✅ Google LibPhoneNumber validation
-   🎯 TypeScript support
-   🔄 Two flexible layouts
-   🏳️ Country emoji flags support
-   📞 Automatic country detection
-   🎨 Dark theme support
-   🎭 Country-specific phone number masking
-   🔧 Extensive API

## 🚀 Installation

```bash
npm install @linhnguyen96114/react-native-phone-input

# For iOS
cd ios && pod install
```

**Requires** React `>=19.0.0` and React Native `>=0.87.0`, plus `react-native-safe-area-context`.
Upgrading from 3.x? See the [migration guide](MIGRATION.md) — `value` is now a real controlled
prop and `onChangeFormattedText` emits proper E.164.

## 💡 Examples

### Basic Usage

<img src="image/basic.png" width="300" style="border-radius: 10px; margin: 20px 0;">

```tsx
import PhoneInput from "@linhnguyen96114/react-native-phone-input";

const BasicExample = () => {
    const [value, setValue] = useState("");

    return <PhoneInput value={value} defaultCode="US" onChangeText={setValue} withShadow autoFocus />;
};
```

### Custom Styled Input

<img src="image/custom_style.png" width="300" style="border-radius: 10px; margin: 20px 0;">

```tsx
const CustomStyledExample = () => {
    const [value, setValue] = useState("");

    return (
        <PhoneInput
            value={value}
            defaultCode="US"
            onChangeText={setValue}
            containerStyle={{
                width: "100%",
                borderRadius: 30,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3
            }}
            textContainerStyle={{
                borderRadius: 30,
                backgroundColor: "#fff",
                paddingHorizontal: 15
            }}
        />
    );
};
```

### Dark Theme

<img src="image/dark_style.png" width="300" style="border-radius: 10px; margin: 20px 0;">

```tsx
const DarkThemeExample = () => {
    const [value, setValue] = useState("");

    return (
        <PhoneInput
            value={value}
            defaultCode="GB"
            onChangeText={setValue}
            withDarkTheme
            containerStyle={{
                backgroundColor: "#2A2A2A",
                borderRadius: 12
            }}
            textContainerStyle={{
                backgroundColor: "#2A2A2A",
                borderRadius: 12
            }}
            textInputStyle={{
                color: "#fff"
            }}
        />
    );
};
```

### Form Integration with Validation

<img src="image/form_style.png" width="300" style="border-radius: 10px; margin: 20px 0;">

```tsx
const FormExample = () => {
    const [value, setValue] = useState("");
    const [valid, setValid] = useState(false);
    const phoneInput = useRef<PhoneInputRefType>(null);

    const checkValidation = () => {
        const isValid = phoneInput.current?.isValidNumber(value);
        setValid(isValid || false);
    };

    return (
        <PhoneInput
            ref={phoneInput}
            value={value}
            defaultCode="FR"
            onChangeText={setValue}
            onChangeFormattedText={(text) => {
                console.log("Formatted:", text);
            }}
            containerStyle={{
                width: "100%",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: valid ? "#4CAF50" : "#dee2e6"
            }}
        />
    );
};
```

### Phone Number Masking

```tsx
const MaskingExample = () => {
    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState("");

    return (
        <PhoneInput
            value={value}
            defaultCode="US"
            onChangeText={setValue}
            onChangeFormattedText={setFormattedValue}
            withMask
            withShadow
            containerStyle={{
                width: "100%",
                borderRadius: 12
            }}
        />
    );
};
// User types: 1234567890
// Display shows: (123) 456-7890
// onChangeText receives: "1234567890"
// onChangeFormattedText receives: "+11234567890"
```

## 🛠️ Props

| Prop                       | Type                         | Description                           |
| -------------------------- | ---------------------------- | ------------------------------------- |
| `withDarkTheme`            | `boolean`                    | Enable dark theme                     |
| `withShadow`               | `boolean`                    | Add shadow effect                     |
| `withMask`                 | `boolean`                    | Enable country-specific phone masking |
| `autoFocus`                | `boolean`                    | Auto focus input                      |
| `defaultCode`              | `CountryCode`                | Default country code                  |
| `defaultCallingCode`       | `string`                     | Default calling code                  |
| `value`                    | `string`                     | Controlled value; supplying it at mount makes the component controlled for life |
| `defaultValue`             | `string`                     | Uncontrolled seed, read once at mount |
| `disabled`                 | `boolean`                    | Disable input                         |
| `disableArrowIcon`         | `boolean`                    | Hide the dropdown arrow icon          |
| `placeholder`              | `string`                     | Input placeholder text                |
| `onChangeCountry`          | `(country: Country) => void` | Callback when country changes         |
| `onChangeText`             | `(text: string) => void`     | Callback when input text changes      |
| `onChangeFormattedText`    | `(text: string) => void`     | Callback with formatted phone number  |
| `onBlur`                   | `() => void`                 | Callback when input loses focus       |
| `onFocus`                  | `() => void`                 | Callback when input gains focus       |
| `renderDropdownImage`      | `React.ReactNode`            | Custom dropdown icon component        |
| `containerStyle`           | `StyleProp<ViewStyle>`       | Container style                       |
| `textContainerStyle`       | `StyleProp<ViewStyle>`       | Text input container style            |
| `textInputProps`           | `TextInputProps`             | Additional TextInput props            |
| `textInputStyle`           | `StyleProp<TextStyle>`       | Text input style                      |
| `codeTextStyle`            | `StyleProp<TextStyle>`       | Country code text style               |
| `flagButtonStyle`          | `StyleProp<ViewStyle>`       | Flag button container style           |
| `countryPickerButtonStyle` | `StyleProp<ViewStyle>`       | Country picker button style           |
| `layout`                   | `"first" \| "second"`        | Layout style                          |
| `filterProps`              | `CountryFilterProps`         | Country filter props                  |
| `countryPickerProps`       | `Partial<CountryPickerModalProps>` | Country picker modal props; `countryCode` and `onSelect` are set internally |
| `flagSize`                 | `number`                     | Size of the country flag              |
| `showCountryCode`          | `boolean`                    | Show the country code                 |

## 🔧 Methods

| Method                                  | Return Type                                    | Description                                               |
| --------------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| `getCountryCode`                        | `CountryCode`                                  | Get the currently selected country code                   |
| `getCallingCode`                        | `CallingCode \| undefined`                     | Get the calling code for the selected country             |
| `isValidNumber`                         | `boolean`                                      | Validate if the provided phone number is valid            |
| `getNumberAfterPossiblyEliminatingZero` | `{ number: string \| undefined; formattedNumber: string \| undefined; }` | `number` has a leading zero stripped; `formattedNumber` is E.164 and keeps the zero where the region requires it |

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) to learn about our development process.

## 📝 License

This project is [MIT](LICENSE) licensed.

---

<p>
  Fork from <a href="https://github.com/garganurag893/react-native-phone-number-input">garganurag893/react-native-phone-number-input</a>
  <br/>
  Maintained with ❤️ by <a href="https://github.com/linhnguyen-gt">Linh Nguyen</a>
</p>
