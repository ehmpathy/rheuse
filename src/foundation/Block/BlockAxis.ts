import { createIsOfEnum } from 'type-fns';

/**
 * an axis along which we can describe the contents of a block
 */
export enum BlockAxis {
  /**
   * the vertical axis
   * - the one parallel to the height of the block
   * - when this is the primary axis, children are ordered top to bottom (i.e., in a column)
   */
  VERTICAL = 'VERTICAL',

  /**
   * the horizontal axis
   * - the one parallel to the width of the block
   * - when this is the primary axis, children are ordered left to right (i.e., in a row)
   */
  HORIZONTAL = 'HORIZONTAL',
}
export const isOfBlockAxis = createIsOfEnum(BlockAxis);
