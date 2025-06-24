import { BlockAxis } from './BlockAxis';
import { BlockSize } from './BlockSize';
import { BlockFillabilityConfiguration } from './ParentBlockConfiguration';
import { BlockAxisFillConfiguration } from './castToBlockAxisFillConfiguration';

/**
 * defines which axises of a block are fillable by children
 *
 * specifically
 * - an axis is fillable via growth if the block sets an explicit size or is itself filling that axis
 * - an axis is fillable via min size if the block sets a min size in that axis
 *
 * why do we care?
 * - react.native.os alone has a nonstandard implementation of flexBasis in flexDirection:column (https://github.com/necolas/react-native-web/issues/1604; https://github.com/VeryBuy/react-native-web/commit/25cce7e0d14ae073174a525b5bf3d4808740cff6)
 * - due to this, we must manually ignore `fill` requests in axises that dont have a size constraint (react.native.web and react.original.web do this for us out of the box, but react.native.os does not)
 * - without this, the child will expand the parent instead of simply filling it when parent doesn't have constrained size
 */
export const computeBlockFillabilityConfiguration = ({
  fill,
  size,
  axis,
}: {
  fill: BlockAxisFillConfiguration;
  size: BlockSize;
  axis: { primary: BlockAxis };
}): BlockFillabilityConfiguration => {
  // define whether the block is itself filling in each axis
  const isFillingAxis = fill.absolute;

  // define whether the block has an explicit size in each axis
  const hasExplicitSize = {
    horizontally: !!size?.mag?.width && size.mag.width !== 'fill',
    vertically: !!size?.mag?.height && size.mag.height !== 'fill',
  };

  const hasMinSize = {
    horizontally: !!size?.min?.width,
    vertically: !!size?.min?.height,
  };

  // define whether each axis is the secondary one
  const isSecondaryAxis = {
    horizontal: axis.primary === BlockAxis.VERTICAL,
    vertical: axis.primary === BlockAxis.HORIZONTAL,
  };

  // now define the fillability in each axis
  return {
    horizontally: isSecondaryAxis.horizontal
      ? { grow: true } // if it's the secondary axis, then it can always be filled safely (only primary axis has filling issues)
      : isFillingAxis.horizontal
      ? { grow: true } // if it itself is filling, then children can fill with grow
      : hasExplicitSize.horizontally || hasMinSize.horizontally
      ? { grow: true } // if it has an explicit size, then children can fill with grow
      : // : theMinSize.horizontally
        // ? { min: theMinSize.horizontally } // if it has a min size, then children can fill with min
        false,
    vertically: isSecondaryAxis.vertical
      ? { grow: true } // if it's the secondary axis, then it can always be filled safely (only primary axis has filling issues)
      : isFillingAxis.vertical
      ? { grow: true } // if it itself is filling, then children can fill with grow
      : hasExplicitSize.vertically || hasMinSize.vertically
      ? { grow: true } // if it has an explicit size, then children can fill with grow
      : // : theMinSize.vertically
        // ? { min: theMinSize.vertically } // if it has a min size, then children can fill with min
        false,
  };
};
