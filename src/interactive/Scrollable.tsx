import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { isPresent } from 'type-fns';

import { useParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { PrimitiveIdentifier, PrimitiveStyle } from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import { ActionOnPressFunctionAsync } from './Actionable';

const PrimitiveScroll = ScrollView; // TODO: make this isomorphic by detecting the environment. or maybe through provider.context

/**
 * a primitive scroll component for making it possible to scroll in a cross-platform way
 *
 * features
 * - easily customize the appearance of the scroll bar on web.desktop (e.g., color, width, etc.)
 */
export const Scrollable = ({
  children,
  direction = 'vertical',
  snap,
  onSize,
  onRefresh,
  id,
  _override,
}: {
  children: ReactNode;
  size: 'fill'; // TODO: allow primitive size control input; for now, we just fill the container
  direction?: 'horizontal' | 'vertical';
  onRefresh?: ActionOnPressFunctionAsync;

  /**
   * enables specifying that the scroll view should snap to the top or bottom
   *
   * for example
   * - snapping to top will ensure that if user scrolls to the top, if more items are added to the top, it will scroll back to the top (e.g., to show new entries in an inbox)
   * - snapping to the bottom does the same but to the bottom (e.g., to show new chat messages)
   */
  snap?: {
    /**
     * specifies whether we should stop to top or bottom
     */
    to: 'top' | 'bottom';

    /**
     * specifies the threshold at which to snap
     */
    // threshold?: { top?: number; bottom?: number }; // TODO: enable when usecase arises
  };

  /**
   * a method which allows users to listen to the size of the scrollable
   *
   * fires
   * - on initial mount of scrollable
   * - on subsequent changes to the scrollable size
   */
  onSize?: (size: { width: number; height: number }) => void;

  /**
   * ids you can assign the scrollable
   */
  id?: PrimitiveIdentifier;

  /**
   * this setting should only be used for debugging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbo
   */
  _override?: PrimitiveStyle;
}) => {
  // lookup parent config
  const parent = useParentBlockConfiguration();

  // define scrollbar styles based on settings
  // const stylesScrollbar: PrimitiveStyle = // TODO: enable hiding scrollbars in browser
  //   scrollbar?.visible === false
  //     ? {
  //         // https://stackoverflow.com/a/38994837/3068233
  //         '-ms-overflow-style': 'none' /* Internet Explorer 10+ */,
  //         'scrollbar-width': 'none' /* Firefox */,
  //         '&::-webkit-scrollbar': {
  //           display: 'none' /* Safari and Chrome */,
  //         },
  //       }
  //     : {};

  // grab a ref to the scrollview, to enable programatic control
  const scrollViewRef = useRef<ScrollView>(null);

  // define whether we are snapped to a specific position or not
  const [isSnapped, setIsSnapped] = useState(
    true, // define that we should mount snapped to that position
  );

  // define how to scroll to a snapped position if needed
  const onCheckToScrollForSnap = useCallback(() => {
    // if snap not specified, do nothing
    if (!snap) return;

    // if not snapped to position, do nothing
    if (!isSnapped) return;

    // if snapped and requested, snap to the position requested
    if (snap.to === 'top') scrollViewRef.current?.scrollTo({ y: 0 });
    if (snap.to === 'bottom') scrollViewRef.current?.scrollToEnd();
  }, [snap, isSnapped]);

  // define how to track whether we are snapped to a position
  const onCheckToSnap = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // if snap not specified, do nothing
    if (!snap) return;

    // calculate whether we are close to top or bottom
    const closenessThreshold = 30;
    const distanceFromTop = event.nativeEvent.contentOffset.y;
    const distanceFromBottom =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.contentOffset.y -
      event.nativeEvent.layoutMeasurement.height;
    const isCloseToTop = distanceFromTop < closenessThreshold;
    const isCloseToBottom = distanceFromBottom < closenessThreshold;

    // if we are close to top or bottom, mark that we are snapped
    if (isCloseToTop && snap.to === 'top') return setIsSnapped(true);
    if (isCloseToBottom && snap.to === 'bottom') return setIsSnapped(true);

    // otherwise, mark that we are certainly not snapped
    setIsSnapped(false);
  };

  // trigger checking to scroll for snap whenever snap status changes
  useEffect(() => {
    if (!isSnapped) return;
    onCheckToScrollForSnap();
  }, [isSnapped, onCheckToScrollForSnap]);

  // define what to do on scroll
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onCheckToSnap(event);
  };

  // define what to do on content size change
  const onContentSizeChange = () => {
    onCheckToScrollForSnap();
  };

  // define what the do when the scrollview size changes
  const onLayout = (event: LayoutChangeEvent) => {
    onSize?.({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
    onCheckToScrollForSnap();

    // TODO: scroll to prior position if not snapped, too
  };

  // render the component
  return (
    <PrimitiveScroll
      nativeID={id?.native}
      testID={['rheuse:scrollable', id?.test].filter(isPresent).join(':')}
      ref={scrollViewRef}
      horizontal={direction === 'horizontal'}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      scrollEventThrottle={300}
      onLayout={onLayout}
      showsHorizontalScrollIndicator={false} // todo: make this an input, if someone does want to show the scroll indicator for some 'crazy' reason
      keyboardShouldPersistTaps="handled" // ensures that user can still tap on buttons even while keyboard is up; default in the browser, not default in react-native
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={onRefresh.isInProgress}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      style={{
        ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),
        ..._override,
      }}
    >
      {children}
    </PrimitiveScroll>
  );
};
