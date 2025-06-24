import { UnexpectedCodePathError } from '@ehmpathy/error-fns';

import { BlockAxis } from './BlockAxis';
import { BlockSize } from './BlockSize';
import { ParentBlockConfiguration } from './ParentBlockConfiguration';

/**
 * specifies the which axises to fill within the parent block
 */
export interface BlockAxisFillConfiguration {
  /**
   * the fill configuration in the flex axis coordinates
   *
   * note
   * - this is defined relative to the primary axis of the parent
   */
  relative: {
    primary: boolean;
    secondary: boolean;
  };

  /**
   * the fill configuration in the absolute axis coordinates
   */
  absolute: {
    horizontal: boolean;
    vertical: boolean;
  };
}

/**
 * define whether an axis of a parent is fillable by a specific mode
 */
export const isParentBlockAxisFillable = ({
  parent,
  axis,
  mode,
}: {
  /**
   * the configuration of the parent we are checking the fillability of
   */
  parent: ParentBlockConfiguration | null;
  /**
   * the axis we are checking the fillability of in the parent
   */
  axis: BlockAxis;
  /**
   * blocks can be fillable via growth or via min size
   * - via growth, if block sets an explicit size, max size, or is itself filling that axis
   * - via min size, if block sets a min size in that axis
   */
  mode: 'grow' | 'min';
}) => {
  // if parent is undefined, default always to fillable; that way, we can fill initial/nonblock containers (otherwise, we'd never be able to fill the root parent!); // !: note, this means that we can only safely fill block and size.mag or size.max components in all environments. bind to a block asap!
  if (!parent) return true;

  // define the fillability config of the requested axis
  const axisFillability =
    axis === BlockAxis.VERTICAL
      ? parent.fillable.vertically
      : parent.fillable.horizontally;

  // if parent is explicitly not fillable in this axis, return
  if (!axisFillability) return false;

  // if mode grow, check if parent is fillable via growth in that axis
  if (mode === 'grow') return axisFillability.grow === true;

  // if mode min, check if parent is fillable via min size
  if (mode === 'min') return axisFillability.min !== undefined;

  // if we reached here, the parent configuration was malformed, so fail fast
  throw new UnexpectedCodePathError(
    'invalid parent block configuration for fillability',
    { parent, axis, mode },
  );
};

/**
 * hook which exposes the configuration of which axis to fill in the parent block based on size configuration
 */
export const castToBlockAxisFillConfiguration = ({
  size,
  parent,
}: {
  size: BlockSize;
  parent: ParentBlockConfiguration | null;
}): BlockAxisFillConfiguration => {
  // evaluate which of the axises we've been asked to fill
  const fillRequestedBySize: { horizontal: boolean; vertical: boolean } = {
    horizontal: size?.mag?.width === 'fill',
    vertical: size?.mag?.height === 'fill',
  };

  // evaluate which axis we're able to fill in the parent
  const fillAllowedViaGrow = {
    horizontal:
      isParentBlockAxisFillable({
        parent,
        axis: BlockAxis.HORIZONTAL,
        mode: 'grow',
      }) ||
      isParentBlockAxisFillable({
        parent,
        axis: BlockAxis.VERTICAL,
        mode: 'min',
      }),
    vertical:
      isParentBlockAxisFillable({
        parent,
        axis: BlockAxis.VERTICAL,
        mode: 'grow',
      }) ||
      isParentBlockAxisFillable({
        parent,
        axis: BlockAxis.VERTICAL,
        mode: 'min',
      }),
  };

  // evaluate which axis we should fill, based on ability and request
  const fill = {
    horizontal: fillRequestedBySize.horizontal && fillAllowedViaGrow.horizontal,
    vertical: fillRequestedBySize.vertical && fillAllowedViaGrow.vertical,
  };

  // define the relative fill definition based on absolute coordinates
  const fillRelative =
    (parent?.axis.primary ?? BlockAxis.VERTICAL) === BlockAxis.VERTICAL // if no parent, assume vertical by default
      ? {
          primary: fill.vertical,
          secondary: fill.horizontal,
        }
      : {
          primary: fill.horizontal,
          secondary: fill.vertical,
        };

  // return this information
  return { absolute: fill, relative: fillRelative };
};
