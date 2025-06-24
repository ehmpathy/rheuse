import {
  Primitive,
  PrimitiveDimensionValue,
  PrimitiveStyle,
} from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { BlockAxis } from './Block';
import { useParentBlockConfiguration } from './Block/ParentBlockConfiguration';

/**
 * a universal component for displaying a divider
 */
export const Divider = ({
  axis,
  color = '#EBECF0',
  size = 'fill',
}: {
  axis: 'vertical' | 'horizontal';
  color?: string;
  size?: PrimitiveDimensionValue | 'fill';
}) => {
  const styleOfBorder = {
    color,
    style: 'solid' as const,
    thickness: 1,
  };
  const stylesForBorder: PrimitiveStyle =
    axis === 'horizontal'
      ? {
          borderTopColor: styleOfBorder.color,
          borderTopWidth: styleOfBorder.thickness,
          borderStyle: styleOfBorder.style,
        }
      : {
          borderLeftColor: styleOfBorder.color,
          borderLeftWidth: styleOfBorder.thickness,
          borderStyle: styleOfBorder.style,
        };
  const stylesForDimensions: PrimitiveStyle =
    size === 'fill'
      ? {}
      : axis === 'horizontal'
      ? {
          width: size,
        }
      : { height: size };

  const parent = useParentBlockConfiguration();
  const styleFill =
    size === 'fill'
      ? getPrimitiveFillStyles({
          size: axis === 'horizontal' ? { width: 'fill' } : { height: 'fill' },
          parent: parent ?? null,
        })
      : {};

  // define whether parent is centering the secondary axis
  const hasParentCenteringSecondaryAxis =
    parent?.axis.primary === BlockAxis.VERTICAL
      ? parent?.center.horizontally
      : parent?.center.vertically;
  const styleCenterSelfInParent = {
    // override the secondary axis if the parent has asked to center on it
    ...(hasParentCenteringSecondaryAxis
      ? { alignSelf: 'center' as const }
      : {}), // if parent is centering on secondary axis, then this block must center itself to avoid unexpected behavior (also, this is the default behavior or `alignItems: undefined` -> stretch, unless parent centers)
  };

  return (
    <Primitive
      style={{
        ...stylesForBorder,
        ...stylesForDimensions,
        ...styleFill,
        ...styleCenterSelfInParent,
      }}
    />
  );
};
