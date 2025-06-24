import { UnexpectedCodePathError } from '@ehmpathy/error-fns';

import { BlockAxis, isOfBlockAxis } from './BlockAxis';

export const castAxisInputToBlockAxis = (
  axisInput:
    | 'horizontal'
    | 'vertical'
    | BlockAxis
    | { primary: 'horizontal' | 'vertical' | BlockAxis },
): { primary: BlockAxis } => {
  const axisInputString =
    typeof axisInput === 'string' ? axisInput : axisInput.primary;
  const axisInputUppercase = axisInputString.toUpperCase();
  if (!isOfBlockAxis(axisInputUppercase))
    throw new UnexpectedCodePathError('axis must be of type BlockAxis', {
      axisInput,
      allowedInput: Object.values(BlockAxis),
    });
  const axis = BlockAxis[axisInputUppercase];
  return { primary: axis };
};
