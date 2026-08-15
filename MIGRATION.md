# Migrating from 3.x to 4.0

4.0 tightens the contract in four places and changes what two callbacks emit. Most apps need
one edit — renaming `defaultValue` to `value` — and a peer bump.

## Requirements

| | 3.x | 4.0 |
|---|---|---|
| `react` | unpinned | `>=19.0.0` |
| `react-native` | unpinned | `>=0.87.0` |
| `react-native-safe-area-context` | `*` | `*` |

React 19 is a hard requirement: the component now takes `ref` as a plain prop, which earlier
React versions do not support. React Native 0.87 is the version this release was tested on;
the previous range promised support that was never exercised.

## Breaking changes

### 1. `value` is the controlled prop; `defaultValue` is a seed

In 3.x the displayed string was a fallback chain, picked by `withMask`:

```tsx
value={withMask
    ? displayValue || props.value || props.defaultValue || ""
    : number || props.value || props.defaultValue || ""}
```

Either way internal state won as soon as the user typed one character, so neither `value` nor
`defaultValue` could drive the field afterwards — passing either one only seeded the first
render.

4.0 splits them:

- **`value`** — pass it and the component is controlled for its whole life. The parent owns
  the string and must feed it back from `onChangeText`. Programmatic updates now work.
- **`defaultValue`** — read once at mount and never again. Genuinely uncontrolled.

Controlled-ness is decided at mount and never re-read. Passing `value` on one render and
`undefined` on the next is a consumer bug and warns in development. If a form library hands
you `undefined` on the first render, pass `""` instead.

```diff
 const [value, setValue] = useState("");

 <PhoneInput
-    defaultValue={value}
+    value={value}
     defaultCode="US"
     onChangeText={setValue}
 />
```

If you were relying on the field ignoring the parent after first render, drop the prop
entirely and let the component own its state.

### 2. `ref` is a plain prop

`forwardRef` is gone. Nothing changes at the call site — `ref={phoneInput}` still works and
still resolves to `PhoneInputRefType` — but the component is no longer a `ForwardRefExoticComponent`,
so code that inspected that type, or wrapped the component expecting a forwarded ref, needs
updating. This is what requires React 19.

### 3. Type declarations are generated, not hand-written

The hand-maintained `index.d.ts` at the package root is gone. Declarations are now generated
from source into `lib/typescript/`, and `package.json` resolves them per condition. Every type
the old file published is still exported from the package root:

```ts
import PhoneInput, {
    type PhoneInputProps,
    type PhoneInputRefType,
    type Country,
    type CountryCode,
    type CallingCode,
    type CountryFilterProps,
    type CountryPickerModalProps,
    type Region,
    type Subregion
} from "@linhnguyen96114/react-native-phone-input";
```

One type widened: `countryPickerProps` is now `Partial<CountryPickerModalProps>` rather than
`CountryPickerModalProps`. The component supplies `countryCode` and `onSelect` itself, so
requiring them made the prop unusable. This is source-compatible — anything that typechecked
before still does.

### 4. `onChangeFormattedText` emits real E.164

3.x joined the calling code to the digits: `` `+${code}${digits}` ``. That is wrong wherever a
national trunk prefix is involved, because the rule is regional.

| Input | Country | 3.x emitted | 4.0 emits |
|---|---|---|---|
| `0912345678` | VN | `+840912345678` | `+84912345678` |
| `0612345678` | IT | `+390612345678` | `+390612345678` |
| `2025550123` | US | `+12025550123` | `+12025550123` |

Vietnam drops the trunk zero, Italy keeps it — libphonenumber decides, not the component. If
your backend was stripping a duplicated zero to work around 3.x, remove that workaround.

While a number is still half-typed and cannot be parsed, 4.0 falls back to the same
`+<callingCode><digits>` join 3.x always used, so the callback stays useful on every keystroke.

This applies in every mode. In 3.x the output differed depending on whether `withMask` was on;
a formatter that behaves differently based on an unrelated display flag was the bug, not the
feature.

## Behaviour changes that are not API changes

- **`getNumberAfterPossiblyEliminatingZero().formattedNumber` follows the same E.164 rule.**
  3.x built it from the hand-stripped national number, so Italian `0612345678` came back as
  `+39612345678` — a different string from what `onChangeFormattedText` emitted for the same
  input. 4.0 returns `+390612345678` from both. The `number` field still strips a leading zero,
  and is now `""` rather than `undefined` before anything is typed.
- **`isValidNumber` no longer strips a leading zero by hand.** It delegates the trunk-prefix
  rule to libphonenumber, matching `onChangeFormattedText`. Italian `0612345678` now validates
  `true`; it returned `false` in 3.x while the formatted output claimed it was valid.
- **Masked input stops at the mask's capacity.** Only for the 25 countries with a hand-authored
  pattern — the `DEFAULT` pattern is a guess and never caps. Applies to typed input, a seeded
  `defaultValue`, a controlled `value`, and switching to a country with a shorter mask; a
  switch that truncates reports the new value through `onChangeText`.
- **Under `withMask`, `onChangeText` emits digits only.** The mask is applied on the way to the
  screen; the parent stores raw digits. This was already true in 3.x but is now the documented
  contract in both directions — a controlled `value` is also raw digits.
- **`countryPickerProps` merges with the default theme instead of replacing it.** In 3.x,
  supplying any picker props dropped the default, so `withDarkTheme` silently stopped applying
  to the picker. An explicit `theme` inside `countryPickerProps` still wins.
- **The caret stays put on mid-string edits.** Inserting or deleting inside a masked number no
  longer throws the caret to the end.

## Not changed

`layout`, `withShadow`, `withDarkTheme`, `withMask`, `disabled`, `disableArrowIcon`,
`placeholder`, `autoFocus`, `flagSize`, `showCountryCode`, every style prop, `filterProps`,
`onChangeCountry`, `onBlur`, `onFocus`, and all four ref methods keep their 3.x signatures.

## 3.x support

3.x receives no further releases. The 4.0 branch rewrote the state layer, so a fix there is a
second implementation rather than a cherry-pick.
