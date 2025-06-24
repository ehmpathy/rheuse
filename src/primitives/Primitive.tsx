import React, { ReactNode, Ref } from 'react';
import { View, ViewStyle } from 'react-native';

/**
 * overwrite the react-native styles with our own primitive types, which we can then publish universally
 */
export type PrimitiveStyle = ViewStyle & {
  height?: PrimitiveDimensionValue;
  width?: PrimitiveDimensionValue;
  marginTop?: PrimitiveDimensionValue;
  marginBottom?: PrimitiveDimensionValue;
} & {
  // for some reason, react.native.web types are not loaded on github-actions, but are locally (maybe a postinstall script?) // todo: resolve why these types are not found on github-actions envs and eliminate this custom code; https://github.com/necolas/react-native-web/issues/832
  visibility?: string; // ignored by react.native.os, used by react.native.web
  boxSizing?: 'border-box'; // set by default by react native, can be ignored safely; https://stackoverflow.com/questions/38503451/does-it-exist-an-equivalent-of-box-sizing-border-box-in-flexbox-for-react-nativ
  boxShadow?: string; // ignored by react.native.os, used by react.native.web
  userSelect?: string; // ignored by react.native.os, used by react.native.web
};

/**
 * values that the dimensions of a primitive can have
 */
export type PrimitiveDimensionValue = number | `${number}%`;
export const isOfPrimitiveDimensionValue = (
  value: string | number,
): value is PrimitiveDimensionValue =>
  typeof value === 'number' ||
  (typeof value === 'string' && value.endsWith('%'));

/**
 * ids you can assign a rheusable component
 */
export interface PrimitiveIdentifier {
  /**
   * an id you can assign to the component for native usage
   *
   * note
   * - in react.native, this sets the `nativeId` prop
   * - in web environments, this is exposed on the DOM as the `id` attribute
   */
  native?: string;

  /**
   * an id you can assign the component for testing and debugging
   *
   * note
   * - in react.native, this sets the `testID` prop
   * - in web environments, this is exposed on the DOM as the `data-testid` attribute
   */
  test?: string;
}

/**
 * a universal primitive component, which works isomorphically in react and react-native
 *
 * note
 * - replaces `div` in the browser
 * - replaces `View` in react-native
 * - should not be used directly, unless there is something missing from the rheusable foundation
 *
 * scope
 * - draw a visual
 * - wrap a visual
 */
export const Primitive = ({
  style,
  children,
  refTo: { element: refToElement } = {},
  onSize,
  id,
}: {
  style?: PrimitiveStyle;
  children?: ReactNode;
  refTo?: { element?: Ref<View> | null };

  /**
   * a callback for when the size of the primitive changes
   *
   * fires
   * - on initial mount of component
   * - on changes to the components size
   */
  onSize?: (size: { width: number; height: number }) => void;

  /**
   * ids you can assign the primitive
   */
  id?: PrimitiveIdentifier;
}) => {
  // return the component; // TODO: support react.og.web environment (e.g., `div`)
  return (
    <View
      style={{ display: 'flex', flexDirection: 'column', ...style }}
      ref={refToElement}
      nativeID={id?.native}
      testID={id?.test}
      onLayout={
        onSize
          ? (event) =>
              onSize({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height,
              })
          : undefined
      }
    >
      {children ?? null}
    </View>
  );
};
