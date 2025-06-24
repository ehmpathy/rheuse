import { useWindowDimensions } from 'react-native';

/**
 * a universal hook for getting the dimension of the viewport
 */
export const useViewportDimensions = (): { width: number; height: number } => {
  const viewport = useWindowDimensions(); // TODO: get from elsewhere in react.og.web
  return viewport;
};
