# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [3.9.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/v3.8.1...v3.9.0) (2026-10-08)

### Features

* **flag:** let callers resize the flag container and skip the button's responsive width ([#15](https://github.com/linhnguyen-gt/react-native-phone-number-input/issues/15)) ([d1a276d](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/d1a276d9a34a0176af1b12b2b769ad3c6da0d598))

## [3.8.1](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/v3.8.0...v3.8.1) (2026-08-26)

* refactor!: take ref as a prop instead of wrapping in forwardRef ([04b43f2](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/04b43f28202c3ce1cde13b0d658edc834b9193de))
* feat!: narrow the peer range to react >=19 and react-native >=0.87 ([3898244](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/38982443201cccd78b83f4d0ddf8b8fe9dc6ab1e))
* fix(types)!: generate the published declarations instead of hand-writing them ([46849ec](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/46849ec9f764ff7f858c42e3b221cecf2d14a33d))

### Bug Fixes

* correct the defects found in the 4.0 review pass ([d0bb523](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/d0bb523779c0a42d5ad4438ca13a3f01f6f27168))
* **example:** repair the android and ios builds under React Native 0.87 ([f60ab65](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f60ab6548bfc80a900f89713450acbc949cec0cd))
* **layout:** resolve proportional sizes against the current window ([6a843e3](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/6a843e3e2c86235803b049c07261bbe18a5ffe11))
* **phone-input:** replace close fallback image and clear lint errors ([c396b8b](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/c396b8b4081d4b00dbda8b995d022e1d1e348e1c))
* **picker:** keep the modal's animated value across renders ([b771236](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/b771236419c92987477f37b90fac2f2023f981fa))
* **picker:** make every state setter a functional update ([42981f1](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/42981f18fd9da6e14d5877b614716a545ac780a4))
* **picker:** size country rows against the current window ([a7fa364](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/a7fa3641aeaa5250728a373807f6b624d474eb79))
* **picker:** split picker state, surface load errors, and retry on reopen ([258a53e](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/258a53e85df06d88d3b9d60ec5b5c3b631d7afd1))

### Features

* **masking:** cap masked input, emit E.164, and keep the caret in place ([4694c98](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/4694c98a55c3ffc63885a05ee60d2cda3743192f))

### Performance Improvements

* stop the picker subtree re-rendering on every keystroke ([1df5dfb](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/1df5dfbc605cfcc7847c188effd1fc97ab244ab9))

### BREAKING CHANGES

* PhoneInput is no longer a ForwardRefExoticComponent. Passing a
  ref is unchanged for consumers on React 19.
* react < 19 and react-native < 0.87 are no longer supported.
  The 3.x line remains available for those.
* the published type declarations are generated from the source.
  countryPickerProps is now Partial<CountryPickerModalProps>, which accepts
  everything the old declaration did and more.

# [3.8.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/v3.6.0...v3.8.0) (2025-12-20)


### Features

* implement automated release workflow and configure conventional changelog generation ([f920e2d](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f920e2d289b849e29ce1891b40f117e9c60b0c4d))

# [3.7.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/v3.6.0...v3.7.0) (2025-12-20)


### Features

* implement automated release workflow and configure conventional changelog generation ([f5e33e3](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f5e33e3177296caaab4d72c5a123b5a7cc5fb063))

# [3.6.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.5.0...v3.6.0) (2025-12-20)


### Bug Fixes

* add automated release workflow using GitHub Actions ([0388a99](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/0388a99d962c0c16e5a6fafb4bed903194cd1f10))
* restore country selection by removing incorrect early return guard ([4b842fb](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/4b842fb38590355938dc1d0aeb57e3bf93caddd1))


### Features

* add country-specific phone number masking feature ([8cad9f8](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/8cad9f8cb3dbce0530ce0f485b92eae75616aba2))



# [3.5.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.4.2...3.5.0) (2025-10-10)


### Features

* upgrade package ([ef5d6f9](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/ef5d6f994924f02b6e6cb652906e541bd002f023))
* upgrade version ([382c35b](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/382c35baef412be6805bb54b1894fea4ae741c2c))
* use react-native-safe-area-context SafeAreaView ([578748a](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/578748a1fd0e19b962009ad407ca2652a8954dd7))



## [3.4.2](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.4.1...3.4.2) (2025-04-29)


### Bug Fixes

* remove mandatory lefthook installation ([b5e6dc6](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/b5e6dc652fa8a03609efb72607dc6866f5556ca3))
* remove mandatory lefthook installation ([055c2b9](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/055c2b975aa1a87c1c9a408e753032e2ac106e3d))



## [3.4.1](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.4.0...3.4.1) (2025-04-26)



# [3.4.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.3.2...3.4.0) (2025-03-19)


### Bug Fixes

* change node v ([8787e71](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/8787e7128e8fe15314130bebf07fb0e4115b354f))
* workflow ([cd64a1c](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/cd64a1cc4b22e0d0c4de4a8a12b566771e42ee0e))



## [3.3.2](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.3.1...3.3.2) (2024-12-04)


### Bug Fixes

* virtualizedLists should never be and changed format code ([3d4d781](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/3d4d78162e5ea798e50a10bf15ad10c514da8911))



## [3.3.1](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.2.3...3.3.1) (2024-11-15)


### Features

* add new type and more example and note ([efea337](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/efea337a756b10f58855f2e7a90b417646a61046))



## [3.2.3](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.2.0...3.2.3) (2024-11-12)


### Bug Fixes

* small bug ([5d79465](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/5d79465a5a792e4f4fda69d8a35ccf348d468c9a))
* yarn github action ([f12cfaf](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f12cfafa2ef9ad1b810f6fe12bda77fe96443182))


### Features

* add github action ([7abb43d](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/7abb43dfe3c92c23f41739df5041fd2500856f7c))
* add showCountryCode ([651503b](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/651503bc7f5f459beda6c60fe84b93fe41c03388))
* update version ([319bc98](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/319bc986ebb2a2ba5db0ccc4a9c4fa89a6bd76eb))
* update version ([f37130f](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f37130fe868fdd6c93badd2dae2aacedbe4439bf))



# [3.2.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.1.4...3.2.0) (2024-11-09)


### Bug Fixes

* dark mode and add focus ([9a55bfd](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/9a55bfd9f504976248ca0beeca24d6fb1fb0a09f))
* update readme and type ([a63cde8](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/a63cde82102e534734c1726ef06e97123967f4d3))


### Features

* upgrade version ([c09ec8b](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/c09ec8b2ccc9beaba5c16b13cc35685311047da9))



## [3.1.4](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/3.1.0...3.1.4) (2024-11-08)


### Bug Fixes

* import type ([79fa564](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/79fa564098862bc507c56904020dca2484b21369))


### Features

* done update code and RN ([a43e836](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/a43e8367bae23032ff3a9a8de6ffcc801143472e))
* initiate major codebase update ([4153cd8](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/4153cd8c6bcf6fb5019b136c756442570f5bc5bb))
* update readme and npm ([f387514](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/f38751407f178562b79ff75255bef8014381ee75))
* version 3.1.0 ([fbab67e](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/fbab67e0f43776cd09f0b53c636f55f242be6fea))



# [2.1.0](https://github.com/linhnguyen-gt/react-native-phone-number-input/compare/a5769344a3cd81de4d143cf22c5449fd34083036...2.1.0) (2024-01-10)


### Bug Fixes

* add onChangeCountry prop ([d7ed3ea](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/d7ed3ead58998c7fa2ef9ee0232ef5e3cd9ffa5d))
* make onChangeCountry optional ([edd013a](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/edd013a1c59c213732d74c3dd76b1cc365b7ad5b))
* make onChangeCountry optional ([a2fff64](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/a2fff64f94120b50c5fa56b05a5a982133e03bb7))
* style input ([4b46609](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/4b46609cfba356c8c3f28025aa8e7cb0095207f9))
* take disabled value from props inside the constructor ([a576934](https://github.com/linhnguyen-gt/react-native-phone-number-input/commit/a5769344a3cd81de4d143cf22c5449fd34083036))
