import { UnexpectedCodePathError } from '@ehmpathy/error-fns';

import { PrimitiveDimensionValue } from '../../primitives/Primitive';
import { BlockAxis } from './BlockAxis';
import {
  BlockSize,
  isBlockDimensionFlexGrowUnit,
  isDimensionViewportUnit,
} from './BlockSize';
import { ParentBlockConfiguration } from './ParentBlockConfiguration';

const castDimensionViewportUnitToPixels = ({
  unit,
  viewport,
}: {
  unit: `${number}vw` | `${number}vh`;
  viewport: { width: number; height: number };
}) => {
  // support viewport height
  if (unit.endsWith('vh')) {
    const ratio = parseInt(unit.replace('vh', ''), 10);
    if (isNaN(ratio))
      throw new UnexpectedCodePathError('invalid vh height specified. isNaN', {
        ratio,
      });
    return viewport.height * 0.01 * ratio;
  }

  // support viewport width
  if (unit.endsWith('vw')) {
    const ratio = parseInt(unit.replace('vw', ''), 10);
    if (isNaN(ratio))
      throw new UnexpectedCodePathError('invalid vw width specified. isNaN', {
        ratio,
      });
    return viewport.width * 0.01 * ratio;
  }

  // fail fast if invalid
  throw new UnexpectedCodePathError(
    'invalid dimension viewport unit specified',
    { unit, viewport },
  );
};

/**
 * a method which casts a block size configuration to primitive dimension styles
 */
export const castBlockSizeToPrimitiveStyleDimensions = ({
  size,
  viewport,
  parent,
}: {
  size: BlockSize;

  /**
   * the size of the viewport
   *
   * note
   * - can be provided via `useWindowDimensions` from `react-native` https://reactnative.dev/docs/usewindowdimensions
   */
  viewport: { width: number; height: number };

  /**
   * the parent block within which we may need to flex grow
   */
  parent: ParentBlockConfiguration | null;
}): {
  width?: PrimitiveDimensionValue;
  height?: PrimitiveDimensionValue;
  minWidth?: PrimitiveDimensionValue;
  minHeight?: PrimitiveDimensionValue;
  maxWidth?: PrimitiveDimensionValue;
  maxHeight?: PrimitiveDimensionValue;
  flexGrow?: number;
} => {
  // define the standard dimension values
  const dimensionsStandard: {
    width?: PrimitiveDimensionValue;
    height?: PrimitiveDimensionValue;
    minWidth?: PrimitiveDimensionValue;
    minHeight?: PrimitiveDimensionValue;
    maxWidth?: PrimitiveDimensionValue;
    maxHeight?: PrimitiveDimensionValue;
  } = {
    width: (() => {
      if (size?.mag?.width === undefined) return undefined;
      if (size.mag.width === 'fill')
        return !!parent?.fillable.horizontally
          ? '100%' // if fillable horizontally in any method, set to 100% // !: '100%' is required in `react.native+original.web` as without this, width overflows parents (even with max width set)
          : undefined; // if the parent is not fillable, dont attempt to fill it. without this, in react.native.os _only_, it would make the child expand the parent instead of just filling it
      if (size.mag.width === 'contain') return undefined; // !: default behavior is to shrink to fit contents when in conjunction to flexStyles above; https://stackoverflow.com/a/65332769/3068233
      if (isBlockDimensionFlexGrowUnit(size.mag.width)) return undefined; // return undefined to allow flex grow to take over
      if (isDimensionViewportUnit(size.mag.width))
        return castDimensionViewportUnitToPixels({
          unit: size.mag.width,
          viewport,
        });
      return size.mag.width;
    })(),
    height: (() => {
      if (size?.mag?.height === undefined) return undefined;
      if (size.mag.height === 'fill') return undefined; // in `react.native.os`, setting height: 100% when attempting to fill makes it expand its parent unless the parent has an explicit height defined; instead, by just relying on the flex.grow styles, we can avoid this pain
      if (size.mag.height === 'contain') return undefined; // !: default behavior is to shrink to fit contents when in conjunction to flexStyles above; https://stackoverflow.com/a/65332769/3068233
      if (isBlockDimensionFlexGrowUnit(size.mag.height)) return undefined; // return undefined to allow flex grow to take over
      if (isDimensionViewportUnit(size.mag.height))
        return castDimensionViewportUnitToPixels({
          unit: size.mag.height,
          viewport,
        });
      return size.mag.height;
    })(),
    maxWidth: size.max?.width,
    maxHeight: size.max?.height,
    minWidth:
      size.min?.width ??
      (parent?.fillable.horizontally
        ? parent?.fillable.horizontally.min // if fillable by min width, pull that in
        : undefined),
    minHeight:
      size.min?.height ??
      (parent?.fillable.vertically
        ? parent?.fillable.vertically.min // if fillable by min width, pull that in
        : undefined),
  };

  // define the flex dimensions, but only if required, so we dont overwrite other flexGrow definitions if we dont want to specify one ourselves
  const dimensionsFlex: undefined | { flexGrow?: number; flexBasis?: number } =
    (() => {
      // handle width grow units
      if (size.mag?.width && isBlockDimensionFlexGrowUnit(size.mag.width)) {
        // fail fast if we can help the user avoid unexpected behavior
        if (parent && parent.axis.primary === BlockAxis.VERTICAL)
          throw new UnexpectedCodePathError(
            'can not use flex grow on secondary axis of parent block',
            { parent, width: size.mag.width },
          );

        // return the unit value
        const unit = parseInt(size.mag.width.replace('grow', ''), 10);
        if (isNaN(unit))
          throw new UnexpectedCodePathError(
            'invalid flex grow width specified. isNaN',
            {
              unit,
            },
          );
        return { flexGrow: unit };
      }

      // handle height grow units
      if (size.mag?.height && isBlockDimensionFlexGrowUnit(size.mag.height)) {
        // fail fast if we can help the user avoid unexpected behavior
        if (parent && parent.axis.primary === BlockAxis.HORIZONTAL)
          throw new UnexpectedCodePathError(
            'can not use flex grow on secondary axis of parent block',
            { parent, height: size.mag.height },
          );

        // return the unit value
        const unit = parseInt(size.mag.height.replace('grow', ''), 10);
        if (isNaN(unit))
          throw new UnexpectedCodePathError(
            'invalid flex grow height specified. isNaN',
            {
              unit,
            },
          );
        return { flexGrow: unit };
      }

      // return undefined if neither
      return undefined;
    })();

  // merge the two
  return {
    ...dimensionsStandard,
    ...dimensionsFlex,
  };
};
