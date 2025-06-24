import {
  PrimitiveDimensionValue,
  isOfPrimitiveDimensionValue,
} from '../../primitives/Primitive';

/**
 * values that the dimensions of a block can have
 */
export type BlockDimensionValue =
  | PrimitiveDimensionValue
  | 'fill'
  | 'contain'
  | `${number}grow` // support `flex-grow: number` https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow
  | `${number}vw` // support viewport width units https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport
  | `${number}vh`; // support viewport height units https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport

export const isDimensionViewportUnit = (
  value: BlockDimensionValue,
): value is `${number}vw` | `${number}vh` =>
  typeof value === 'string' && (value.endsWith('vw') || value.endsWith('vh'));

export const isBlockDimensionFlexGrowUnit = (
  value?: BlockDimensionValue,
): value is `${number}grow` =>
  typeof value === 'string' && value.endsWith('grow');

export const isOfBlockDimensionValue = (
  value: any,
): value is BlockDimensionValue =>
  value === 'fill' ||
  value === 'contain' ||
  isDimensionViewportUnit(value) ||
  isBlockDimensionFlexGrowUnit(value) ||
  isOfPrimitiveDimensionValue(value);

export interface BlockDimensions<
  Value extends BlockDimensionValue | PrimitiveDimensionValue,
> {
  width?: Value;
  height?: Value;
}
export const isOfBlockDimensions = (
  obj: Record<string, any>,
): obj is BlockDimensions<any> => obj.width || obj.height;

/**
 * specifies the size of a block in longform
 */
export interface BlockSize {
  /**
   * specifies the magnitude of the block's dimensions
   */
  mag?: BlockDimensions<BlockDimensionValue>;

  /**
   * constraints the minimum dimensions of the block
   *
   * note
   * - can be used in conjunction with magnitude to limit the size of the block
   */
  min?: BlockDimensions<PrimitiveDimensionValue>;

  /**
   * constraints the maximum dimensions of the block
   *
   * note
   * - can be used in conjunction with magnitude to limit the size of the block
   */
  max?: BlockDimensions<PrimitiveDimensionValue>;
}
