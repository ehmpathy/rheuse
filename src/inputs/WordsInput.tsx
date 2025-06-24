import React, { CSSProperties, Ref, useEffect, useRef, useState } from 'react';
import { Platform, TextInputProps } from 'react-native';

import { Block } from '../foundation/Block/Block';
import { useParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { castBlockSizeInputToBlockSize } from '../foundation/Block/castBlockSizeInputToBlockSize';
import { castBlockSizeToPrimitiveStyleDimensions } from '../foundation/Block/castBlockSizeToPrimitiveStyleDimensions';
import { useViewportDimensions } from '../foundation/useViewportDimensions';
import {
  castWordsTypographyIntoCssProperties,
  WordsTypography,
} from '../information/Words';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { PrimitiveTextStyle } from '../primitives/PrimitiveText';
import {
  PrimitiveTextInput,
  PrimitiveTextInputAutocomplete,
  PrimitiveTextInputSubject,
} from '../primitives/PrimitiveTextInput';

/**
 * a universal component for capturing words from users (e.g., text input)
 */
export const WordsInput = ({
  typography,
  value,
  onNewValue,
  onEnter,
  onAutocomplete: onAutocomplete,
  onFocus,
  onBlur,
  subject,
  autocomplete,
  disabled,
  placeholder,
  multiline,
  size,
  refInput,
  autofocus,
}: {
  /**
   * the typography to display the writing with
   */
  typography: WordsTypography;

  /**
   * the current value of the users writing
   */
  value: string;

  /**
   * a callback which fires whenever the written value changes
   */
  onNewValue: (newValue: string) => void;

  /**
   * a callback which fires whenever the user presses enter
   */
  onEnter?: () => void;

  /**
   * a callback which fires whenever the input was completely autocompleted
   *
   * for example
   * - empty input autocompleted with phone
   * - empty input autocompleted with confirmation code
   *
   * note
   * - under the hood, this just checks whether the input changed from `""` to a string with 3 or more characters
   *
   * warning
   * - !: when an sms-confirmation-code is autocompleted in ios, ios types in each digit one by one -> this doesn't work; // todo: useDebounce to compare prior and new value between the debounce period (if typed in within 100ms && more than 3 char, then thats too fast for a human -> autocompleted)
   */
  onAutocomplete?: () => void;

  /**
   * a callback which fires whenever the input is focused
   */
  onFocus?: () => void;

  /**
   * a callback which fires whenever the input is blurred
   */
  onBlur?: () => void;

  /**
   * a callback which fires whenever the input is pressed on
   */
  onPress?: (
    event:
      | React.MouseEvent<HTMLInputElement>
      | React.MouseEvent<HTMLTextAreaElement>,
  ) => void;

  /**
   * the subject that is being written about
   *
   * note
   * - this affects the keyboard displayed to the user and how the writing is displayed to the user
   * - for example,
   *   - for `telephone`, shows the telephone keyboard
   *   - for `email', shows the email keyboard
   *   - for `password`, hides the writing from the screen
   */
  subject?: PrimitiveTextInputSubject;

  /**
   * the type of information the user's device should autocomplete for them if possible
   *
   * for example:
   * - 'name'
   * - 'email'
   * - 'tel'
   * - 'postal-code'
   * - 'one-time-code'
   * - 'cc-number'
   * - etc
   *
   * ref
   * - https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
   */
  autocomplete?: PrimitiveTextInputAutocomplete;

  /**
   * the placeholder text to display when there is no input
   */
  placeholder?: string;

  /**
   * whether or not the input is disabled
   */
  disabled?: boolean;

  /**
   * whether the input should be multiline or not
   */
  multiline?: boolean;

  /**
   * a reference to the underlying input element
   */
  refInput?: React.MutableRefObject<HTMLInputElement | null>;

  /**
   * specifies whether the input should be focused when the component mounts
   *
   * note
   * - ℹ️ autoFocus does not work in nextjs:dev deployment for some reason. try in prod if you're seeing this problem
   */
  autofocus?: boolean;

  /**
   * enables setting the size of the input
   */
  size?: Parameters<typeof Block>[0]['size'];
}) => {
  // define the typography styles
  const stylesFromTypography: PrimitiveTextStyle =
    castWordsTypographyIntoCssProperties(typography);

  // define the styles for removing environment default decorations
  const stylesFromRemovals: CSSProperties =
    Platform.OS === 'web'
      ? {
          borderWidth: '0px', // prevents a border on focus in browser
          outlineStyle: 'none', // prevents a border on focus in browser
        }
      : {};

  // grow the size automatically, to the user specified limit, if multiline
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined,
  );
  const viewport = useViewportDimensions();
  const stylesDimensionsInput: PrimitiveTextStyle =
    castBlockSizeToPrimitiveStyleDimensions({
      size: castBlockSizeInputToBlockSize(size),
      viewport,
      parent: null, // note: this doesn't actually need parent, since default setting is always correct (since we wrap with block)
    });
  const stylesDimensionsLineHeight =
    stylesFromTypography.lineHeight ?? typography.font.size * 1.3;
  const multilineHeightBasedOnContent = (() => {
    // if undefined or less than line height, use line height
    if (!contentHeight || contentHeight < stylesDimensionsLineHeight)
      return stylesDimensionsLineHeight;

    // if greater than max height, use max height
    if (
      typeof stylesDimensionsInput.maxHeight === 'number' &&
      stylesDimensionsInput.maxHeight < contentHeight
    )
      return stylesDimensionsInput.maxHeight;

    // if less than min height, use min height
    if (
      typeof stylesDimensionsInput.minHeight === 'number' &&
      stylesDimensionsInput.minHeight > contentHeight
    )
      return stylesDimensionsInput.minHeight;

    // otherwise, use the content height w/ buffer
    return contentHeight + (Platform.OS === 'web' ? 0 : 3); // on ios, there's a 3px diff; we cant apply on web though cause it leads to infiloop of size events
  })();
  const stylesDimensions = {
    // use the user dimensions input
    ...stylesDimensionsInput,

    // set the minimum height to the line height
    minHeight: stylesDimensionsLineHeight,
    height: multilineHeightBasedOnContent,

    // if multiline and no height explicitly specified on input, set height based on content height
    ...(multiline &&
    (stylesDimensionsInput.height === undefined ||
      stylesDimensionsInput.height === '100%')
      ? {
          height: multilineHeightBasedOnContent,
        }
      : {}),
  };

  // wipe out the content height when detected that value changed to `""` outside of keypress
  useEffect(() => {
    if (value === '') setContentHeight(0);
  }, [value]);

  // enable triggering the onAutocomplete function once the onNewValue state update impacts the value (i.e., once react's async batch update of states finishes)
  const wasAutocompletedRef = useRef(false);
  useEffect(() => {
    if (wasAutocompletedRef.current) {
      wasAutocompletedRef.current = false;
      onAutocomplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // define the parent block config
  const parent = useParentBlockConfiguration();

  // define the common properties
  const propsCommon: TextInputProps = {
    value,
    onChange: (event) => {
      // if the input was autocompleted, record that fact
      const wasAutocompleted =
        value === '' && event.nativeEvent.text.length >= 3; // https://stackoverflow.com/a/76524858/3068233
      if (wasAutocompleted) wasAutocompletedRef.current = true; // note!: when an sms-confirmation-code is autocompleted in ios, ios types in each digit one by one -> this doesn't work

      // handle the new value
      if (onNewValue) onNewValue(event.nativeEvent.text);

      // handle the content height if value emptied
      if (event.nativeEvent.text.trim() === '') setContentHeight(0);
    },
    onKeyPress: (event) => {
      if (event.nativeEvent.key === 'Enter' && !multiline && onEnter) onEnter(); // if enter was pressed, call on submit
      // TODO: if multiline and ctrl+enter, then trigger onEnter; amazingly challenging in react-native
    },
    // onSubmitEditing: () => onEnter?.(), // todo: should we prefer onSubmitEditing? right now, causes duplicate submission
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
    autoComplete: autocomplete,
    placeholder,
    placeholderTextColor: 'rgba(0, 0, 0, 0.6)', // todo: make configurable
    style: {
      ...stylesFromTypography,
      ...(stylesFromRemovals as PrimitiveTextStyle),
      ...stylesDimensions,
      ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),
    },
    editable: !disabled, // TODO: use "disabled" in browser
    autoFocus: autofocus,
    keyboardType:
      subject ??
      // if not defined explicitly, try and autocomplete
      (() => {
        if (autocomplete === 'tel') return 'phone-pad';
        if (autocomplete === 'postal-code') return 'number-pad';
        if (autocomplete === 'one-time-code') return 'number-pad';
        return undefined;
      })(),
    onContentSizeChange: (event) =>
      setContentHeight(event.nativeEvent.contentSize.height), // enables growing multiline input height with content height; https://stackoverflow.com/a/59511704/3068233
  };

  // render the element
  return (
    <Block size={size}>
      <PrimitiveTextInput
        multiline={multiline}
        ref={refInput as never}
        {...propsCommon}
      />
    </Block>
  );
};
