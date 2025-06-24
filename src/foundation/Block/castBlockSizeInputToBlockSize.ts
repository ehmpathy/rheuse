import { UnexpectedCodePathError } from '@ehmpathy/error-fns';

import {
  BlockSize,
  isOfBlockDimensionValue,
  isOfBlockDimensions,
} from './BlockSize';
import { BlockSizeInput } from './BlockSizeInput';

/**
 * a method which expands the size input into long form
 */
export const castBlockSizeInputToBlockSize = (
  sizeInput: BlockSizeInput | undefined,
): BlockSize => {
  if (!sizeInput) return {};
  if (isOfBlockDimensionValue(sizeInput))
    return { mag: { width: sizeInput, height: sizeInput } };
  if (isOfBlockDimensions(sizeInput)) return { mag: sizeInput };
  if (isOfBlockDimensionValue(sizeInput.mag))
    return {
      ...sizeInput,
      mag: { width: sizeInput.mag, height: sizeInput.mag },
    };
  if (!sizeInput.mag || isOfBlockDimensions(sizeInput.mag))
    return { ...sizeInput, mag: sizeInput.mag };
  throw new UnexpectedCodePathError('unparsable size input for block', {
    sizeInput,
  });
};
