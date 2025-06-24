import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import { DomainObject } from 'domain-objects';
import React, { ReactNode } from 'react';
import { TextProps } from 'react-native';
import { PickOne } from 'type-fns';

import { PrimitiveStyle } from '../primitives/Primitive';
import { PrimitiveText, PrimitiveTextStyle } from '../primitives/PrimitiveText';

/**
 * a type declaration for recursive partial values
 *
 * TODO:
 * - add to type-fns
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface WordsTypography {
  /**
   * a name you've assigned to this typography combination
   *
   * note
   * - this does not affect display
   * - this is purely to help you identify and distinguish different typographies
   */
  name?: string;

  /**
   * settings that affect the typography at the font level
   */
  font: {
    family?: string;

    /**
     * the font size to use
     *
     * note
     * - we constrain the fontsize to a number, to maximize compositionality (i.e., components can increment and decrement from it)
     */
    size: number;
    weight?:
      | 'normal'
      | 'bold'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900'
      | undefined;
    color?: string;

    /**
     * the decorations to apply to the font
     *
     * for example
     * - `underline`
     * - `green wavy underline`
     * - `strikethrough`
     * - etc
     *
     * ref
     * - https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
     */
    decoration?: PickOne<{
      /**
       * the strikethrough to apply to the font
       */
      strikethrough?: {
        /**
         * sets the color of an underline
         */
        color?: string;

        /**
         * sets the style of an underline
         *
         * note
         * - default is "solid"
         */
        style?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
      };

      /**
       * the underline to apply to the font
       */
      underline?: {
        /**
         * sets the color of an underline
         */
        color?: string;

        /**
         * sets the style of an underline
         *
         * note
         * - default is "solid"
         */
        style?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';

        /**
         * sets the thickness of an underline
         *
         * note
         * - unfortunately not supported by react-native
         */
        thickness?: never; // number;

        /**
         * sets the offset distance of an underline from its original position
         *
         * note
         * - unfortunately not supported by react-native
         *
         * ref
         * - https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-offset
         */
        offset?: never;
      };
    }>;
  };

  /**
   * settings that affect the typography at the letter level
   */
  letter?: {
    /**
     * Sets the horizontal spacing behavior between text characters.
     *
     * > Positive values of letter-spacing causes characters to spread farther apart, while negative values of letter-spacing bring characters closer together.
     *
     * ref
     * - https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
     */
    spacing?: number;
  };

  /**
   * settings that affect the typography at the word level
   */
  word?: {
    /**
     * Sets the length of space between words and between tags.
     *
     * note:
     * - unfortunately not supported in react native
     *
     * ref
     * - https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing
     */
    spacing?: never; // string | null;
  };

  /**
   * settings that affect the typography at the line level
   */
  line?: {
    /**
     * Sets the height of a line box, commonly used to set the distance between lines of text.
     *
     * ref
     * - https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
     */
    height?: number;

    /**
     * Sets the offset of the line boxes with this typography, commonly used to account for poor centering of the font
     */
    offset?: {
      /**
       * Sets a vertical offset of the line box of this typography
       *
       * note
       * - uses `marginTop` under the hood
       */
      vertical?: number;
    };
  };
}
export class WordsTypography
  extends DomainObject<WordsTypography>
  implements WordsTypography {}

/**
 * a method for determining whether an object is a words typography
 */
export const isWordsTypography = (
  obj: Record<string, any>,
): obj is WordsTypography => !!obj.font.family && !!obj.font.size;

/**
 * a method for overriding values of a typography
 */
export const overrideTypography = (
  original: WordsTypography,
  overrides: RecursivePartial<WordsTypography>,
) =>
  new WordsTypography({
    // TODO: find a deep merge library that works
    ...original,
    font: {
      ...original.font,
      ...overrides.font,
    } as WordsTypography['font'],
    letter: { ...original.letter, ...overrides.letter },
    word: { ...original.word, ...overrides.word },
    line: { ...original.line, ...overrides.line },
  });

/**
 * a method for creating a getTypography function
 *
 * TODO: implement
 */
// export const createGetTypography = ({ options }: { options: WordsTypography[] }) =>

/**
 * a method for casting a typography into css properties
 */
export const castWordsTypographyIntoCssProperties = (
  typography: WordsTypography,
): PrimitiveTextStyle => ({
  fontFamily: typography.font?.family,
  fontSize: typography.font?.size,
  fontWeight: typography.font?.weight,
  textDecorationLine:
    typeof typography.font.decoration === 'object'
      ? (() => {
          if (typography.font.decoration.underline) return 'underline' as const;
          if (typography.font.decoration.strikethrough)
            return 'line-through' as const;
          throw new UnexpectedCodePathError(
            'unsupported typography.font.decoration',
            { typography },
          );
        })()
      : undefined,
  textDecorationColor:
    typeof typography.font.decoration === 'object'
      ? (() => {
          if (typography.font.decoration.underline)
            return typography.font.decoration.underline.color;
          if (typography.font.decoration.strikethrough)
            return typography.font.decoration.strikethrough.color;
          throw new UnexpectedCodePathError(
            'unsupported typography.font.decoration',
            { typography },
          );
        })()
      : undefined,
  textDecorationStyle:
    typeof typography.font.decoration === 'object'
      ? (() => {
          if (typography.font.decoration.underline)
            return typography.font.decoration.underline.style as
              | 'solid'
              | 'double'
              | 'dotted'
              | 'dashed'; // todo: confirm wavy not supported in react native?
          if (typography.font.decoration.strikethrough)
            return typography.font.decoration.strikethrough.style as
              | 'solid'
              | 'double'
              | 'dotted'
              | 'dashed'; // todo: confirm wavy not supported in react native?
          throw new UnexpectedCodePathError(
            'unsupported typography.font.decoration',
            { typography },
          );
        })()
      : undefined,
  // textDecorationThickness: // TODO: figure out way to support this in react native
  //   typeof typography.font.decoration === 'object'
  //     ? (() => {
  //         if (typography.font.decoration.underline)
  //           return typography.font.decoration.underline.thickness;
  //         throw new UnexpectedCodePathError(
  //           'unsupported typography.font.decoration',
  //           { typography },
  //         );
  //       })()
  //     : undefined,
  // textUnderlineOffset: // TODO: figure out way to support this in react native
  //   typeof typography.font.decoration === 'object'
  //     ? (() => {
  //         if (typography.font.decoration.underline)
  //           return typography.font.decoration.underline.offset;
  //         throw new UnexpectedCodePathError(
  //           'unsupported typography.font.decoration',
  //           { typography },
  //         );
  //       })()
  //     : undefined,
  color: typography.font?.color,
  letterSpacing: typography.letter?.spacing,
  // wordSpacing: typography.word?.spacing as any, // TODO: resolve
  lineHeight: typography.line?.height
    ? typography.font.size * typography.line.height // TODO: handle difference that in browser css this the `line.height` is a multiplier, but in react native it is the absolute size in px
    : undefined,
  marginTop: typography.line?.offset?.vertical,
});

/**
 * a reusable component for displaying words to a user (a.k.a. text)
 *
 * features
 * - truncate the length of the words to fit a number of lines
 * - interactivity on press of words
 * - explicitly declaring the typography to use
 */
export const Words = ({
  children,
  typography,
  align,
  truncate,
  _override,
}: {
  children: ReactNode;
  typography: WordsTypography;
  align?: 'left' | 'right' | 'center';
  truncate?: {
    /**
     * what to truncate the words to fit within
     */
    to: {
      /**
       * the number of lines to truncate the words to fit within
       */
      lines: number;
    };

    /**
     * what to inform the truncation to a user with
     */
    with?: {
      /**
       * the value to replace the ellipsis with
       *
       * ref
       * - https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow
       */
      ellipsis: string;
    };
  };
  inline?: boolean;

  /**
   * this setting should only be used for debugging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases
   */
  _override?: PrimitiveTextStyle;
}) => {
  // define the typography styles
  const stylesFromTypography: PrimitiveTextStyle =
    castWordsTypographyIntoCssProperties(typography);

  // define the truncation styles
  // const stylesFromTruncation: PrimitiveStyle = truncate // TODO: show that this is only used in browser environment
  //   ? {
  //       // set the properties required to truncate w/ css
  //       overflow: 'hidden',

  //       // https://caniuse.com/css-line-clamp, https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp
  //       display: '-webkit-box',
  //       WebkitBoxOrient: 'vertical',
  //       WebkitLineClamp: truncate.to.lines,

  //       // and set the truncation property
  //       textOverflow: truncate?.with?.ellipsis ?? 'ellipsis', // default to the normal '...' character
  //     }
  //   : {};
  const propsFromTruncation: TextProps = truncate
    ? {
        numberOfLines: truncate.to.lines,
      }
    : {};

  // define the positioning styles
  const stylesFromPositioning: PrimitiveTextStyle = {
    textAlign: align,
  };

  // TODO: specific support for inline
  return (
    <PrimitiveText
      style={{
        includeFontPadding: false, // this is an android.only property which makes vertical centering wonky: https://reactnative.dev/docs/text-style-props?language=typescript#includefontpadding-android
        ...stylesFromTypography,
        ...stylesFromPositioning,
        ..._override,
      }}
      {...propsFromTruncation}
    >
      {children}
    </PrimitiveText>
  );
};
