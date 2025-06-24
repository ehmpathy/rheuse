import { useCallback, useMemo, useState } from 'react';

import { PrimitiveOnPressEvent } from '../primitives/PrimitivePressable';

/**
 * an async executable onclick function, created with `useAsyncOnPress`
 *
 * note
 * - ensures that the promise state of any asynchronous onclick can be reacted to (e.g., show loading indicator)
 */
export type ActionOnPressFunctionAsync<TOutput = any> = ((
  event?: PrimitiveOnPressEvent,
) => Promise<TOutput>) & {
  /**
   * specifies the status of the asynchronous request triggered by this onclick
   *
   * rf
   * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
   */
  status: 'PENDING' | 'FULFILLED' | 'REJECTED' | null;

  /**
   * summarizes whether the async request is in progress
   */
  isInProgress: boolean;
};

export const useAsyncOnPress = <TOutput>(
  logic: (event?: PrimitiveOnPressEvent) => Promise<TOutput>,
): ActionOnPressFunctionAsync<TOutput> => {
  // track the status of the async onclick
  const [status, setStatus] =
    useState<ActionOnPressFunctionAsync['status']>(null);

  // enable checking whether its mounted
  const checkIsMounted = useCallback(() => true, []); // TODO: use a hook and actually evaluate this

  // wrap the logic to track the status of the request
  const logicWithHooks = useCallback(
    async (...args: Parameters<typeof logic>) => {
      try {
        setStatus('PENDING');
        const output = await logic(...args);
        if (checkIsMounted()) setStatus('FULFILLED');
        return output;
      } finally {
        if (checkIsMounted()) setStatus('REJECTED');
      }
    },
    [checkIsMounted, logic],
  );

  // assign the status as a property of the function
  const logicWithHooksAndStatus = useMemo(
    () =>
      Object.assign(logicWithHooks, {
        status,
        isInProgress: status === 'PENDING',
      }),
    [status, logicWithHooks],
  );

  // return the logic wrapped
  return logicWithHooksAndStatus;
};
