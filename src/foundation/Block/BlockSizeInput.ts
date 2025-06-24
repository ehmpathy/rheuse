import { PrimitiveDimensionValue } from '../../primitives/Primitive';
import { BlockDimensionValue, BlockDimensions, BlockSize } from './BlockSize';

/**
 * specifies the size of the block
 *
 * options
 * - `fill`
 *   - shorthand for `{ width: 'fill', height: 'fill' }`
 *   - fills both the primary and secondary axis of the parent block
 * - `contain`
 *   - shorthand for `{ width: 'contain', height: 'contain' }`
 *   - shrinks to fit it's contents in both main axis and cross axis
 * - `{ width: <value>, height: <value> }`
 *   - shorthand for `{ mag: { width: <value>, height: <value> } }`
 *   - value can be a PrimitiveDimensionValue, 'fill', or 'contain'
 *   - value = `fill` will fill the parent container in that axis
 *   - value = `contain` will shrink to fit it's contents in that axis
 * - `{ mag?: { width: <value>, height: <value> }, min?: { width: <value>, height: <value> }?, max: { width: <value>, height: <value> }? }`
 *   - enables setting the `min` and `max` dimensions of the block in addition to the magnitude, `mag`, dimensions value
 */
export type BlockSizeInput =
  | BlockDimensionValue
  | BlockDimensions<BlockDimensionValue>
  | {
      mag: BlockDimensionValue;
      min?: BlockDimensions<PrimitiveDimensionValue>;
      max?: BlockDimensions<PrimitiveDimensionValue>;
    }
  | BlockSize;
