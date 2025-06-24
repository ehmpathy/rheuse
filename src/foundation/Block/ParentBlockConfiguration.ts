import { createContext, useContext } from 'react';
import { PickOne } from 'type-fns';

import { PrimitiveDimensionValue } from '../../primitives/Primitive';
import { BlockAxis } from './BlockAxis';

/**
 * specifies whether and how a block is fillable in each axis
 *
 * note
 * - specifies whether the parent is fillable via growth or min dimension spec
 *   - if fillable via growth, that means that growth can be applied via flexbox and height safely, without the child expanding the parent in `react.native.os`
 *   - if fillable via min dimension, that means that we can only "fill" the minimum height of the parent safely -> we can only pull through the minimum height of the parent to the child
 */
export interface BlockFillabilityConfiguration {
  horizontally:
    | Partial<PickOne<{ grow: true; min: PrimitiveDimensionValue }>>
    | false;
  vertically:
    | Partial<PickOne<{ grow: true; min: PrimitiveDimensionValue }>>
    | false;
}

/**
 * the configuration we track about parent blocks which enables the cross-platform/universal/isomorphic behavior of blocks
 */
export interface ParentBlockConfiguration {
  axis: { primary: BlockAxis };

  /**
   * whether or not the parent is centering its children in a specific axis
   *
   * usecase
   * - setting `alignSelf: center` on the child block if parent is centering on the secondary axis
   */
  center: { horizontally: boolean; vertically: boolean };

  /**
   * whether or not the parent is fillable in a specific axis
   *
   * usecase
   * - requesting 'fill' on a parent that is not fillable is a no-op
   *   - in react.native.web and react.original.web, this is provided by the flexBox implementation automatically
   *   - in react.native.os, due to nonstandard implementation of flexBasis in flexDirection:column, we must do this manually and need this info to do so (without this, the child will expand the parent instead of simply filling it when parent doesn't have constrained size)
   *
   * ref
   * - https://github.com/necolas/react-native-web/issues/1604; https://github.com/VeryBuy/react-native-web/commit/25cce7e0d14ae073174a525b5bf3d4808740cff6
   */
  fillable: BlockFillabilityConfiguration;
}

/**
 * a context which can be used to expose the configuration of the closest parent block
 */
export const ParentBlockConfigurationContext = createContext<
  undefined | ParentBlockConfiguration
>(
  undefined, // can be undefined, since we don't know the configuration of the parent block until we find it && there may not be a parent block
);

/**
 * hook which exposes the configuration of the closest parent block
 *
 * usecases
 * - expose `parent.axis` to identify which is the primary axis of the parent block => define how to "fill" or "contain" the block
 * - expose `parent.center` to identify whether the block needs to `alignSelf: center` on its secondary axis
 */
export const useParentBlockConfiguration = () =>
  useContext(ParentBlockConfigurationContext);
