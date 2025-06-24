import { PrimitiveStyle } from '../../primitives/Primitive';
import { BlockAxisFillConfiguration } from './castToBlockAxisFillConfiguration';

export const castBlockAxisFillConfigurationToPrimitiveStyle = (
  fill: BlockAxisFillConfiguration,
): PrimitiveStyle => ({
  flexGrow: fill.relative.primary ? 1 : 0,
  alignSelf: fill.relative.secondary
    ? ('stretch' as const)
    : ('flex-start' as const),
});
