import {
  Primitive,
  PrimitiveDimensionValue,
  PrimitiveStyle,
} from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { useParentBlockConfiguration } from './Block/ParentBlockConfiguration';

/**
 * a universal spacer which can be used to add or remove space between components
 */
export const Spacer = (
  {
    width,
    height,
    _override,
  }: {
    width?: PrimitiveDimensionValue | 'fill';
    height?: PrimitiveDimensionValue | 'fill';

    /**
     * this setting should only be used for debugging and _not_ in production components
     *
     * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbo
     */
    _override?: PrimitiveStyle;
  } = {
    width: 10,
    height: 10,
  },
) => {
  const styleHorizontal = width
    ? width === 'fill'
      ? // handle width === fill
        {}
      : // support negative unit widths
      (typeof width === 'number' && width < 0) ||
        // support negative percentage widths
        (typeof width === 'string' &&
          width.startsWith('-') &&
          width.endsWith('%'))
      ? {
          marginLeft: width, // if negative, then margin left
        }
      : { width }
    : undefined;

  const styleVertical = height
    ? // handle height === fill
      height === 'fill'
      ? {}
      : // support negative unit heights
      (typeof height === 'number' && height < 0) ||
        // support negative percentage heights
        (typeof height === 'string' &&
          height.startsWith('-') &&
          height.endsWith('%'))
      ? {
          marginTop: height, // if negative, then margin top
        }
      : { height }
    : undefined;

  const parent = useParentBlockConfiguration();
  const styleFill = getPrimitiveFillStyles({
    size: { width, height },
    parent: parent ?? null,
  });

  return (
    <Primitive
      id={{
        test: 'rheuse:spacer', // note, we dont allow customizing ids for spacers yet. not really a forseeable usecase
      }}
      style={{
        ...styleHorizontal,
        ...styleVertical,
        ...styleFill,
        flexShrink: 0,
        ..._override,
      }}
    />
  );
};
