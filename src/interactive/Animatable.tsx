import React, { ReactNode, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { PrimitiveStyle } from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';

/**
 * a universal component that can be animated isomorphically
 *
 * TODO: handle non-native environments (note: supports react.native.os, react.native.web, but not react.original.web)
 */
export const Animatable = ({
  children,
  animation,
}: {
  children: ReactNode;
  animation: {
    translate?: { horizontally?: number; vertically?: number };
    scale?: number;
  };
  size: 'fill'; // TODO: allow other types of size
}) => {
  // lookup parent configuration
  const parent = useParentBlockConfiguration();

  // keep shared values in sync with input props (purpose: to allow for declarative animation, without thinking about sharing things for consumers)
  const translateHorizontally = useSharedValue(0);
  useEffect(() => {
    translateHorizontally.value = animation?.translate?.horizontally ?? 0;
  }, [animation?.translate?.horizontally]);

  const translateVertically = useSharedValue(0);
  useEffect(() => {
    translateVertically.value = animation?.translate?.vertically ?? 0;
  }, [animation?.translate?.vertically]);

  const scaleInput: number | undefined = animation?.scale;
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = scaleInput ?? 1;
  }, [scaleInput]);

  // // transform requested animation into animated style
  const animationStyles = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: translateHorizontally.value,
        },
        {
          translateY: translateVertically.value,
        },
        {
          scale: scale.value,
        },
      ],
    }),
    [translateHorizontally, translateVertically, scale],
  );

  // define the size styles
  const sizeStyles: PrimitiveStyle = {
    ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),
  };

  // return the animated view
  return (
    <Animated.View style={[sizeStyles, animationStyles]}>
      {children}
    </Animated.View>
  );
};
