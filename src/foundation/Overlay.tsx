import { ReactNode } from 'react';

import {
  Primitive,
  PrimitiveDimensionValue,
  PrimitiveStyle,
} from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { Block } from './Block/Block';
import { useParentBlockConfiguration } from './Block/ParentBlockConfiguration';
import { castBlockSizeInputToBlockSize } from './Block/castBlockSizeInputToBlockSize';
import { castBlockSizeToPrimitiveStyleDimensions } from './Block/castBlockSizeToPrimitiveStyleDimensions';
import { useViewportDimensions } from './useViewportDimensions';

/**
 * a universal component for overlaying a component on top of other components
 */
export const Overlay = ({
  children,
  size: sizeInput,
  pin,
  background = { color: 'rgba(0, 0, 0, 0.50)' },
  zIndex = 9,
}: {
  children: ReactNode;
  size?:
    | 'fill'
    | {
        width?: PrimitiveDimensionValue | 'fill';
        height?: PrimitiveDimensionValue | 'fill';
      };
  pin?: {
    top?: PrimitiveDimensionValue;
    bottom?: PrimitiveDimensionValue;
    left?: PrimitiveDimensionValue;
    right?: PrimitiveDimensionValue;
  };
  background?: { color?: string } | null;
  zIndex?: number;
}) => {
  // grab the closest parent block's config
  const parent = useParentBlockConfiguration();

  // define the sizes
  const size = castBlockSizeInputToBlockSize(sizeInput);
  const viewport = useViewportDimensions();
  const sizeStyles: PrimitiveStyle = castBlockSizeToPrimitiveStyleDimensions({
    size,
    viewport,
    parent: parent ?? null,
  });

  // define the flex fill styles
  const flexFillStyles = getPrimitiveFillStyles({
    size,
    parent: parent ?? null,
  });

  const locationStyles: PrimitiveStyle = {
    top: pin?.top ?? (sizeInput === 'fill' ? 0 : undefined),
    bottom: pin?.bottom ?? (sizeInput === 'fill' ? 0 : undefined),
    left: pin?.left ?? (sizeInput === 'fill' ? 0 : undefined),
    right: pin?.right ?? (sizeInput === 'fill' ? 0 : undefined),
    zIndex, // note: zIndex does not work well with react-native; tons of usability issues. beware; https://reactnative.dev/docs/layout-props#zindex
  };

  const backgroundStyles = {
    backgroundColor: background?.color ?? undefined,
  };
  return (
    <Primitive
      style={{
        position: 'absolute',
        ...flexFillStyles,
        ...sizeStyles, // this must go after flex fill styles, otherwise grow units will be overwritten
        ...locationStyles,
        ...backgroundStyles,
      }}
    >
      <Block size="fill">{children}</Block>
    </Primitive>
  );
};
