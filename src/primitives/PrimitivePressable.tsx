import { GestureResponderEvent, Pressable } from 'react-native';

export const PrimitivePressable = Pressable; // todo: make this isomorphic by detecting the environment. or maybe through provider.context
export type PrimitiveOnPressEvent = GestureResponderEvent; // todo: make this isomorphic by detecting the environment. or maybe through provider.context
