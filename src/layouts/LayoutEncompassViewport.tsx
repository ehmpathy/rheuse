import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { useParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { Primitive } from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';

/**
 * a rheusable layout component which expands to viewport of the device and eliminates overflow - while also avoiding keyboards
 *
 * usecases
 * - guarantee parity between rn.web and rn.native for requiring scrollviews in order to see content
 * - avoid keyboards when they appear
 *
 * note
 * - ⚠️ the layout _will_ be constrained to the parent's size if there is one (i.e., it may be smaller than the window, if it's parent is already smaller)
 *
 * ref
 * - https://github.com/necolas/react-native-web/discussions/2289
 *
 * todo: consider using animation to make this more performant
 */
export const LayoutEncompassViewport = ({
  children,
  parentHeaderHeight,
  childBottomInset,
}: {
  children: ReactNode;

  /**
   * this is the height of the parent component's header, if any
   *
   * note
   * - this is required for the keyboard avoiding view to work properly; without this, the keyboard will still overlap your content by the size of the header, if any
   */
  parentHeaderHeight: number;

  /**
   * this is the size of the inset that child components apply to avoid device notches, etc. if any
   *
   * note
   * - this is required for the keyboard avoiding view to work properly; without this, this inset will sit on top of the keyboard - duplicating the inset (since they keyboard provides its own)
   */
  childBottomInset: number;
}) => {
  const parent = useParentBlockConfiguration();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions(); // todo: use `useWindowSize` from `rheuse` for isomorphic results

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={parentHeaderHeight - childBottomInset}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        // set size based on window
        height: windowHeight ?? '100vh', // constrain size to window height. default to 100vh
        width: windowWidth ?? '100vw',

        // constrain to parent, if any (sets maxHeight and maxWidth)
        ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),
      }}
    >
      <Primitive
        style={{
          display: 'flex',
          flexDirection: 'column',

          // set size based on window
          height: windowHeight ?? '100vh', // constrain size to window height. default to 100vh
          width: windowWidth ?? '100vw',

          // constrain to parent, if any (sets maxHeight and maxWidth)
          ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),

          // ensure parity between rn.web and rn.native regarding requiring a scrollview in order to have scrolling; https://github.com/necolas/react-native-web/discussions/2289
          overflow: 'hidden',
        }}
      >
        {children}
      </Primitive>
    </KeyboardAvoidingView>
  );
};
