import { BlockSizeInput } from '../foundation/Block/BlockSizeInput';
import { ParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { castBlockAxisFillConfigurationToPrimitiveStyle } from '../foundation/Block/castBlockAxisFillConfigurationToPrimitiveStyle';
import { castBlockSizeInputToBlockSize } from '../foundation/Block/castBlockSizeInputToBlockSize';
import { castToBlockAxisFillConfiguration } from '../foundation/Block/castToBlockAxisFillConfiguration';
import { PrimitiveStyle } from './Primitive';

/**
 * defines universally safe fill styles for primitive components
 *
 * note
 * - without this, setting flexGrow and height/width: 100% is dangerous as it can expand the parent instead of just filling it in certain environments
 *   - specifically, in `react.native.os` this is a known issue when parent.axis.primary=vertical
 *   - in web environments, like `react.native.web` and `react.original.web`, this issue does not exist
 */
export const getPrimitiveFillStyles = ({
  size,
  parent,
}: {
  size: BlockSizeInput;
  parent: ParentBlockConfiguration | null;
}): Pick<
  PrimitiveStyle,
  'maxWidth' | 'maxHeight' | 'flexGrow' | 'alignSelf'
> => {
  return {
    // set max size
    ...castBlockAxisFillConfigurationToPrimitiveStyle(
      castToBlockAxisFillConfiguration({
        size: castBlockSizeInputToBlockSize(size),
        parent,
      }),
    ),

    // additionally, constrain to max of parent
    maxWidth: '100%', // constrain to max of parent
    maxHeight: '100%', // constrain to max of parent
  };
};
