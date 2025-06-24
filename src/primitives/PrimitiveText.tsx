import { Text, TextStyle } from 'react-native';

/**
 * a primitive text component, which works isomorphically in react and react-native
 */
export const PrimitiveText = Text; // todo: make this isomorphic by detecting the environment. or maybe through provider.context

export type PrimitiveTextStyle = TextStyle;
