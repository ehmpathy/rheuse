import { Link as ExpoLink } from 'expo-router';
import React, { createContext, useContext } from 'react';

/**
 * .what = information about the configuration of a primitive link
 */
interface PrimitiveLinkConfiguration {
  href: Parameters<typeof ExpoLink>[0]['href'];
}

/**
 * a context which can be used to expose the configuration of the closest parent primitive link
 */
export const PrimitiveLinkConfigurationContext = createContext<
  undefined | PrimitiveLinkConfiguration
>(
  undefined, // can be undefined, since we don't know the configuration of the parent block until we find it && there may not be a parent block
);

/**
 * hook which exposes the configuration of the closest primitive link
 *
 * usecases
 * - detect whether a component is already within a primitive link, to prevent nested anchor tags; ref: https://github.com/shadcn-ui/ui/issues/2559
 */
export const useParentPrimitiveLinkConfiguration = () =>
  useContext(PrimitiveLinkConfigurationContext);

export const PrimitiveLink = (input: Parameters<typeof ExpoLink>[0]) => (
  <PrimitiveLinkConfigurationContext.Provider value={{ href: input.href }}>
    <ExpoLink {...input} />
  </PrimitiveLinkConfigurationContext.Provider>
); // todo: make this isomorphic by detecting the environment. or maybe through provider.context

/**
 * targets that you can assign to a link which affect how it is opened in the web
 *
 * - _self: the current browsing context. (Default)
 * - _blank: usually a new tab, but users can configure browsers to open a new window instead.
 * - _parent: the parent browsing context of the current one. If no parent, behaves as _self.
 * - _top: the topmost browsing context (the "highest" context that's an ancestor of the current one). If no ancestors, behaves as _self.
 */
export enum PrimitiveLinkTarget {
  SAME_TAB = '_self',
  NEW_TAB = '_blank',
}
