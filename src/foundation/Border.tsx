import { ReactNode, useMemo } from 'react';
import { Platform } from 'react-native';
import { asSerialJSON } from 'serde-fns';
import { PickOne, isPresent } from 'type-fns';

import {
  Primitive,
  PrimitiveIdentifier,
  PrimitiveStyle,
} from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { Block } from './Block/Block';

const isTwoOptionPaddingInput = (
  args: Record<string, number | undefined>,
): args is { vertical?: number; horizontal?: number } =>
  !!args.vertical || !!args.horizontal;

/**
 * a universal component for displaying a border around content
 * - border via whitespace
 * - border via line
 * - border via shadow
 * - border via background
 *
 * features
 * - default padding
 * - default radius
 * - default color
 */
export const Border = ({
  children,
  outline = { color: '#EBECF0', thickness: 1 },
  padding: paddingInput = 7,
  radius = 9,
  background,
  shadow,
  size,
  onSize,
  center,
  id,
  _debuglog,
  _override,
}: {
  children?: ReactNode;

  /**
   * an outline of the border
   */
  outline?: {
    color?: string | null;
    thickness?: number;
  } | null;

  /**
   * the whitespace of the border
   */
  padding?:
    | null
    | number
    | { vertical?: number; horizontal?: number }
    | {
        horizontal?: undefined;
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
      };

  /**
   * the radius of the border
   *
   * default=5
   */
  radius?:
    | number
    | {
        top?: number | { left: number; right: number };
        bottom?: number | { left?: number; right?: number };
      };
  /**
   * the background within the border
   */
  background?: PickOne<{ color: string; blur: true }>;

  /**
   * the shadow of the border
   */
  shadow?: { color?: string; opacity?: number; size?: number };

  /**
   * enables setting the size of the border
   *
   * note
   * - this is the outermost size of the border. padding and outlines will be contained within this size
   */
  size?: Parameters<typeof Block>[0]['size'];

  onSize?: Parameters<typeof Block>['0']['onSize'];

  center?: Parameters<typeof Block>[0]['center'];

  /**
   * ids you can assign the border
   */
  id?: PrimitiveIdentifier;

  /**
   * this setting should only be used for debugging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases
   */
  _override?:
    | (PrimitiveStyle & {
        outerBlock?: undefined;
        centerPrimitive?: undefined;
        innerBlock?: undefined;
      })
    | {
        outerBlock?: PrimitiveStyle;
        centerPrimitive?: PrimitiveStyle;
        innerBlock?: PrimitiveStyle;
      };

  /**
   * this setting should only be enabled for debug logging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbol
   */
  _debuglog?: { outerBlock?: true; centerPrimitive?: true; innerBlock?: true };
}) => {
  // specify the padding styles of the border
  const stylesPadding: PrimitiveStyle = (() => {
    if (paddingInput === null) return {};
    if (typeof paddingInput === 'number') return { padding: paddingInput };
    if (isTwoOptionPaddingInput(paddingInput))
      return {
        paddingLeft: paddingInput.horizontal,
        paddingRight: paddingInput.horizontal,
        paddingTop: paddingInput.vertical,
        paddingBottom: paddingInput.vertical,
      };
    return {
      paddingLeft: paddingInput.left,
      paddingRight: paddingInput.right,
      paddingTop: paddingInput.top,
      paddingBottom: paddingInput.bottom,
    };
  })();

  // specify the radius styles of the border
  const stylesRadius: PrimitiveStyle = useMemo(() => {
    // handle common radius case
    if (typeof radius === 'number') return { borderRadius: radius };

    // handle break out cases
    return {
      borderTopLeftRadius:
        typeof radius.top === 'number' ? radius.top : radius.top?.left,
      borderTopRightRadius:
        typeof radius.top === 'number' ? radius.top : radius.top?.right,
      borderBottomLeftRadius:
        typeof radius.bottom === 'number' ? radius.bottom : radius.bottom?.left,
      borderBottomRightRadius:
        typeof radius.bottom === 'number'
          ? radius.bottom
          : radius.bottom?.right,
    };
  }, [asSerialJSON(radius)]);

  // specify the outline styles of the border
  const stylesOutline: PrimitiveStyle = {
    borderColor:
      outline?.color === undefined
        ? 'rgba(0, 0, 0, 0.25)' // default to this
        : outline?.color ?? 'transparent', // unless it was null
    borderWidth: outline?.thickness ?? 0,
    borderStyle: 'solid',
  };

  // allow user to specify the background within the border
  const stylesBackground: PrimitiveStyle = (() => {
    if (background?.color) return { backgroundColor: background.color };
    if (background?.blur) return { backdropFilter: 'blur(10px)' };
    return {};
  })();

  // allow user to specify the shadow of the border
  const stylesShadow: PrimitiveStyle = shadow
    ? Platform.OS === 'web'
      ? {
          boxShadow: `${shadow.size ?? 1}px ${shadow.size ?? 1}px ${
            (shadow.size ?? 1) * 2
          }px 0px ${shadow.color ?? 'rgba(0,0,0,0.75)'}`,
        }
      : {
          shadowColor: shadow.color ?? 'black',
          shadowOffset: { width: shadow.size ?? 1, height: shadow.size ?? 1 },
          shadowOpacity: shadow.opacity ?? 0.75,
          shadowRadius: shadow.size ?? 1,
        }
    : {};

  // define the overflow of the container
  const stylesOverflow: PrimitiveStyle = {
    overflow: radius && !shadow ? 'hidden' : 'hidden', // if there's a radius, must set overflow to hidden (otherwise children wont respect radius); but, only if no shadow; // todo: allow user to specify turning overflow on (off by default) and error if incompatible
  };

  return (
    <Block
      size={size}
      onSize={onSize}
      _override={_override?.outerBlock}
      _debuglog={_debuglog?.outerBlock}
    >
      {({ parent }) => {
        // define the flex styles
        const stylesFlex: PrimitiveStyle = {
          ...getPrimitiveFillStyles({ size: 'fill', parent }),
          flexBasis: 'auto',
        };

        // define the center primitive override
        const overrideCenterPrimitive =
          _override?.centerPrimitive ??
          (!_override?.outerBlock && !_override?.innerBlock // if none of the other two are specified either, assume the whole thing is override for just the center
            ? _override
            : undefined);

        // merge the styles
        const stylesMerged = {
          ...stylesBackground,
          ...stylesShadow,
          ...stylesOutline,
          ...stylesOverflow,
          ...stylesPadding,
          ...stylesRadius,
          ...stylesFlex,
          ...overrideCenterPrimitive,
        };

        // allow debug logging the relevant display constants if requested
        if (_debuglog?.centerPrimitive)
          console.log(
            JSON.stringify(
              {
                id,
                centerPrimitive: {
                  context: {
                    parent,
                  },
                  styleIn: {
                    stylesBackground,
                    stylesShadow,
                    stylesOutline,
                    stylesOverflow,
                    stylesPadding,
                    stylesFlex,
                    _override: overrideCenterPrimitive,
                  },
                  styleOut: stylesMerged,
                },
              },
              null,
              2,
            ),
          );

        return (
          <Primitive
            id={{
              ...id,
              test: ['rheuse:border', id?.test].filter(isPresent).join(':'),
            }}
            style={stylesMerged}
          >
            <Block
              size="fill"
              _override={_override?.innerBlock}
              _debuglog={_debuglog?.innerBlock}
              center={center}
            >
              {children}
            </Block>
          </Primitive>
        );
      }}
    </Block>
  );
};
