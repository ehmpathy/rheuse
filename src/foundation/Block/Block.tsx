import { ReactNode } from 'react';
import { isAFunction, isPresent } from 'type-fns';

import {
  Primitive,
  PrimitiveIdentifier,
  PrimitiveStyle,
} from '../../primitives/Primitive';
import { useViewportDimensions } from '../useViewportDimensions';
import { BlockAxis } from './BlockAxis';
import { BlockSize } from './BlockSize';
import { BlockSizeInput } from './BlockSizeInput';
import {
  ParentBlockConfiguration,
  ParentBlockConfigurationContext,
  useParentBlockConfiguration,
} from './ParentBlockConfiguration';
import { castAxisInputToBlockAxis } from './castAxisInputToBlockAxis';
import { castBlockAxisFillConfigurationToPrimitiveStyle } from './castBlockAxisFillConfigurationToPrimitiveStyle';
import { castBlockSizeInputToBlockSize } from './castBlockSizeInputToBlockSize';
import { castBlockSizeToPrimitiveStyleDimensions } from './castBlockSizeToPrimitiveStyleDimensions';
import { castToBlockAxisFillConfiguration } from './castToBlockAxisFillConfiguration';
import { computeBlockFillabilityConfiguration } from './computeBlockFillabilityConfiguration';

/**
 * a universal Block of components
 *
 * usage
 * - use instead of `div` and `View` when trying to arrange children together
 *
 * features
 * - intuitively named inputs for simply and expressively defining layouts
 * - reduced scope of inputs, to constrain usage to well established best practices
 * - isomorphic, to ensure consistent usage universally (e.g., in both react and react-native)
 */
export const Block = ({
  children,
  axis: axisInput = 'vertical',
  center: centerInput,
  size: sizeInput,
  onSize,
  wrap,
  relatable,
  overlayable,
  overflowable,
  invisible,
  id,
  _override,
  _debuglog,
}: {
  /**
   * the children to render within the block
   *
   * note
   * - allows passing in a function which can be given the parent context directly, if desired
   *   - useful in cases where you're composing blocks and primitives and need the parent context immediately for an inner block; e.g., in Border
   *   - should not be needed in most usecases
   */
  children?:
    | ReactNode
    | (({ parent }: { parent: ParentBlockConfiguration }) => ReactNode);

  /**
   * specifies the primary axis of the block
   */
  axis?: 'vertical' | 'horizontal' | BlockAxis;

  /**
   * enables centering the children of the block
   */
  center?:
    | true
    | 'horizontally'
    | 'vertically'
    | 'both'
    | {
        horizontally?: boolean;
        vertically?: boolean;
      };

  /**
   * specifies the size of the block
   *
   * note
   * - see the jsdoc of the `BlockSizeInput` type for more details
   */
  size?: BlockSizeInput;

  /**
   * a method which allows users to listen to the size of the block
   *
   * fires
   * - on initial mount of block
   * - on subsequent changes to the blocks size
   */
  onSize?: (size: { width: number; height: number }) => void;

  /**
   * specifies whether a Block should wrap its contents instead of shrinking them or overflowing
   */
  wrap?: boolean;

  /**
   * specifies whether a Block should allow children to relate their size in percentages to it
   *
   * note
   * - applies 'position: relative' under the hood
   */
  relatable?: boolean;

  /**
   * specifies whether a Block should allow an Overlay to position itself inside of it
   *
   * note
   * - applies 'position: relative' under the hood
   */
  overlayable?: boolean;

  /**
   * specifies whether a Block should allow its contents to overflow out of it
   *
   * usecases
   * - hide any overflow from an overlay within itself
   * - hide any spillover from an element within it
   *
   * note
   * - applies 'overflow: hidden' under the hood
   */
  overflowable?: boolean;

  /**
   * enables making a block invisible, while still taking up space
   *
   * usecases
   * - overlaying something over top of the block, while not displaying its contents, while retaining the parent dimensions
   */
  invisible?: boolean;

  /**
   * ids you can assign the block
   */
  id?: PrimitiveIdentifier;

  /**
   * this setting should only be used for debugging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbo
   */
  _override?: PrimitiveStyle;

  /**
   * this setting should only be enabled for debug logging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbol
   */
  _debuglog?: true | string;
}) => {
  // grab the closest parent block's config
  const parent = useParentBlockConfiguration();

  // decode axi input
  const axis = castAxisInputToBlockAxis(axisInput);

  // expand the size input into long form
  const size: BlockSize = castBlockSizeInputToBlockSize(sizeInput);

  // expand the center input into long form
  const center: { horizontally: boolean; vertically: boolean } =
    centerInput === true || centerInput === 'both'
      ? { horizontally: true, vertically: true }
      : centerInput === 'horizontally'
      ? { horizontally: true, vertically: false }
      : centerInput === 'vertically'
      ? { horizontally: false, vertically: true }
      : {
          horizontally: centerInput?.horizontally ?? false,
          vertically: centerInput?.vertically ?? false,
        };

  // define whether parent is centering the secondary axis
  const hasParentCenteringSecondaryAxis =
    parent?.axis.primary === BlockAxis.VERTICAL
      ? parent?.center.horizontally
      : parent?.center.vertically;

  // summarize whether we were asked to and can fill primary axis or secondary axis
  const fill = castToBlockAxisFillConfiguration({
    size,
    parent: parent ?? null,
  });

  // convert the axis + centering specification to flex inputs
  const stylesFlex: PrimitiveStyle = {
    // define that this is a flex component
    display: 'flex',

    // avoid making children stretch to fill this block by default
    alignItems: 'flex-start', // !: this is the opposite of default behavior, but makes sizing much more explicit and intuitive; https://www.w3docs.com/snippets/css/how-to-make-flex-items-take-the-content-width.html

    // allow shrinking size below content size if necessary
    flexShrink: fill.relative.primary // if user wants to fill primary axis of parent block, then then must allow size to be below content size
      ? 1 // allow shrinking; // !: default in browser = 1, default in native = 0; hardcode to 1 for consistency
      : 0,

    // fill the parent axises based on configuration
    ...castBlockAxisFillConfigurationToPrimitiveStyle(fill),

    // override the secondary axis if the parent has asked to center on it
    ...(hasParentCenteringSecondaryAxis
      ? { alignSelf: 'center' as const }
      : {}), // if parent is centering on secondary axis, then this block must center itself to avoid unexpected behavior (also, this is the default behavior or `alignItems: undefined` -> stretch, unless parent centers)

    // define the flex direction
    flexDirection:
      axis.primary === BlockAxis.VERTICAL
        ? ('column' as const)
        : ('row' as const),

    // handle center vertically
    ...(center?.vertically
      ? axis.primary === BlockAxis.VERTICAL
        ? { justifyContent: 'center' as const } // when vertical, vertical centering is via justifyContent (primary axis)
        : { alignItems: 'center' as const } // when horizontal, vertical centering is via alignItems (secondary axis)
      : {}),

    // handle center horizontally
    ...(center?.horizontally
      ? axis.primary === BlockAxis.HORIZONTAL
        ? { justifyContent: 'center' as const } // when horizontal, horizontal centering is via justifyContent (primary axis)
        : { alignItems: 'center' as const } // when vertical, horizontal centering is via alignItems (secondary axis)
      : {}),

    // handle wrapping
    flexWrap: wrap ? 'wrap' : 'nowrap',

    // normalize flex basis operation
    flexBasis: 'auto', // note: we are able to use 'auto' here in all environments because we are compensating for `react.native.os`'s nonconformance to spec by manually disabling filling when parent is not "fillable" (nonconformance is a known issue: https://github.com/necolas/react-native-web/issues/1604; https://github.com/VeryBuy/react-native-web/commit/25cce7e0d14ae073174a525b5bf3d4808740cff6)
  };

  // convert the scroll specification into overflow styles
  const stylesOverflow: PrimitiveStyle = {
    // handle overflow disabled
    ...(overflowable === false ? { overflow: 'hidden' as const } : {}),
  };

  // convert visibility specifications into styles
  const stylesVisibility: PrimitiveStyle = invisible
    ? {
        visibility: 'hidden',
        opacity: 0, // visibility: hidden is not supported in react.rn.native (only react.og.web and react.rn.web), opacity does the trick there though; https://stackoverflow.com/a/62093021/3068233
      }
    : {};

  // allow user to explicitly specify the size of a block
  const viewport = useViewportDimensions();
  const stylesDimensions: PrimitiveStyle =
    castBlockSizeToPrimitiveStyleDimensions({
      size,
      viewport,
      parent: parent ?? null,
    });

  // allow user to specify this block should allow overlays or children relating sizes to it
  const stylesOverlay =
    overlayable || relatable ? { position: 'relative' as const } : {};

  // merge the styles
  const stylesMerged: PrimitiveStyle = {
    ...stylesFlex,
    ...stylesDimensions, // !: must be after stylesFlex, since it may need to override the flexGrow setting (e.g., when using `${number}grow` units)
    ...stylesOverflow,
    ...stylesOverlay,
    ...stylesVisibility,
    boxSizing: 'border-box', // include borders in width/height calc; https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
    ..._override,
  };

  // define the context this block will provide as a parent to its children
  const fillable = computeBlockFillabilityConfiguration({
    fill,
    size,
    axis,
  });
  const provides: ParentBlockConfiguration = { axis, center, fillable };

  // allow debug logging the relevant display constants if requested
  if (_debuglog)
    console.log(
      JSON.stringify(
        {
          id,
          parent,
          computed: {
            fill,
          },
          styleIn: {
            stylesFlex,
            stylesDimensions,
            stylesOverflow,
            stylesOverlay,
            stylesVisibility,
            _override,
          },
          provides,
          styleOut: stylesMerged,
        },
        null,
        2,
      ),
    );

  // return the resultant component
  return (
    <ParentBlockConfigurationContext.Provider
      value={{ axis, center, fillable }}
    >
      <Primitive
        id={{
          ...id,
          test: ['rheuse:block', id?.test].filter(isPresent).join(':'),
        }}
        onSize={onSize}
        style={stylesMerged}
      >
        {isAFunction(children) ? children({ parent: provides }) : children}
      </Primitive>
    </ParentBlockConfigurationContext.Provider>
  );
};
