import React, { ReactNode, useState } from 'react';
import { Modal } from 'react-native';

import { ParentBlockConfigurationContext } from '../foundation/Block/ParentBlockConfiguration';

/**
 * state for specifying whether something is open
 */
export interface OpenState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * a reusable hook for easily defining and managing the state of whether something is open
 */
export const useOpenState = (): OpenState => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    setIsOpen,
  };
};

/**
 * a primitive modal component which can be used to safely render modals in a cross-platform way
 *
 * benefits
 * - supports `react.native.web`, `react.native.os`, and `react.original.web` isomorphically and consistently
 *
 * features
 * - clears out the parent block context, since modals apply their own parent style context, but in `react.native.web` and `react.original.web` the parent block context may still flow through
 */
export const PrimitiveModal = ({
  children,
  state,
}: {
  children: ReactNode;
  state: OpenState;
}) => {
  return (
    <ParentBlockConfigurationContext.Provider
      value={
        undefined // clear the previous block context, since modals reset the state - but the react context may still flow through
      }
    >
      <Modal
        visible={state.isOpen}
        presentationStyle="pageSheet" // enables swipe down gesture to close on ios ; // TODO: enable selecting isomorphically
        animationType="slide" // TODO: enable selecting isomorphically
        onDismiss={() => state.setIsOpen(false)}
        onRequestClose={() => state.setIsOpen(false)} // handles native hardware close requests
      >
        {children}
      </Modal>
    </ParentBlockConfigurationContext.Provider>
  );
};
