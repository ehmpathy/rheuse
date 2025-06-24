import { TextInput } from 'react-native';

export const PrimitiveTextInput = TextInput; // todo: make this isomorphic by detecting the environment. or maybe through provider.context

/**
 * universally supported text subject types
 *
 * note
 * - this affects the keyboard displayed to the user and how the writing is displayed to the user
 * - for example,
 *   - for `telephone`, shows the telephone keyboard
 *   - for `email', shows the email keyboard
 *   - for `password`, hides the writing from the screen
 */
export type PrimitiveTextInputSubject =
  | 'default'
  | 'number-pad'
  | 'decimal-pad'
  | 'numeric'
  | 'email-address'
  | 'phone-pad'
  | 'url';

/**
 * universally supported text autocomplete hints
 */
export type PrimitiveTextInputAutocomplete =
  | `off`

  // contact
  | `email`
  | `tel`

  // address
  | `postal-code`
  | `address-line1`
  | `address-line2`
  | `street-address`
  | `country`

  // name
  | `name`
  | `additional-name`
  | `family-name`
  | `given-name`
  | `honorific-prefix`
  | `honorific-suffix`

  // payment
  | `cc-number`

  // credentials
  | `username`
  | `current-password`
  | `new-password`
  | `one-time-code`;
