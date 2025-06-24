import { UnexpectedCodePathError } from '@ehmpathy/error-fns';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import {
  CursorValue,
  Platform,
  PressableStateCallbackType,
} from 'react-native';
import { isAFunction } from 'type-fns';

import { Block } from '../foundation/Block/Block';
import { useParentBlockConfiguration } from '../foundation/Block/ParentBlockConfiguration';
import { castBlockSizeInputToBlockSize } from '../foundation/Block/castBlockSizeInputToBlockSize';
import { castToBlockAxisFillConfiguration } from '../foundation/Block/castToBlockAxisFillConfiguration';
import { PrimitiveIdentifier, PrimitiveStyle } from '../primitives/Primitive';
import { getPrimitiveFillStyles } from '../primitives/PrimitiveFill';
import {
  PrimitiveLink,
  PrimitiveLinkTarget,
  useParentPrimitiveLinkConfiguration,
} from '../primitives/PrimitiveLink';
import {
  PrimitiveOnPressEvent,
  PrimitivePressable,
} from '../primitives/PrimitivePressable';
import { Animatable } from './Animatable';
import { ActionOnPressFunctionAsync } from './useAsyncOnPress';

export const invokeHapticFeedback = async (
  type: 'light' | 'medium' | 'heavy',
) => {
  if (Platform.OS === 'web') return; // do nothing on web, since its unsupported, and instead will throw an error
  if (type === 'light')
    return await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (type === 'medium')
    return await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  if (type === 'heavy')
    return await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  throw new UnexpectedCodePathError('unsupported haptic type', { type });
};

/**
 * a sync executable onclick function
 */
export type ActionOnPressFunctionSync = ((
  event?: PrimitiveOnPressEvent,
) => undefined | void) & {
  status?: undefined;
  isInProgress?: undefined;
}; // https://stackoverflow.com/q/57951850/3068233

export { ActionOnPressFunctionAsync };
export interface ActionOnPressFunction {
  onPress: ActionOnPressFunctionAsync | ActionOnPressFunctionSync;
}
export interface ActionOnHoldFunction {
  onHold: ActionOnPressFunctionAsync | ActionOnPressFunctionSync;
}
export interface ActionHrefLink {
  href: string | { uri: string; target: PrimitiveLinkTarget };
  trace?: {
    /**
     * whether to trace the prior url or not; defaults to true // todo: eliminate this once expo-router works better; also, remove from rheuse
     */
    prior?: boolean;
  };
}
export interface ActionHashScroll {
  hash: string;
}
export type Action =
  | ActionOnPressFunction
  | ActionOnHoldFunction
  | ActionHrefLink
  | ActionHashScroll;

export const hasOnPressAction = (
  action?: Action,
): action is ActionOnPressFunction => !!(action as any)?.onPress;
export const hasOnHoldAction = (
  action?: Action,
): action is ActionOnHoldFunction => !!(action as any)?.onHold;
export const hasHrefLinkAction = (action?: Action): action is ActionHrefLink =>
  !!(action as any)?.href;
export const hasHashScrollAction = (
  action?: Action,
): action is ActionHashScroll => !!(action as any)?.hash;

/**
 * a universal component that makes interactivity simple
 */
export const Actionable = ({
  children,
  action: actionInput,
  cursor = 'pointer',
  feedback = {
    scale: 0.98,
    haptic: 'light',
  },
  disabled,
  _override,
  _debuglog,
}: {
  children:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode);
  action?: Action;
  cursor?: CSSStyleDeclaration['cursor'] & CursorValue;
  disabled?: boolean;
  size: 'fill'; // TODO: allow primitive size control input; for now, we just fill the container
  feedback?: {
    haptic?: 'light' | 'medium' | 'heavy' | null;
    scale?: number | null;
  };

  /**
   * ids you can assign the block
   */
  id?: PrimitiveIdentifier;

  /**
   * this setting should only be used for debugging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbo
   */
  _override?: PrimitiveStyle;

  /**
   * this setting should only be enabled for debug logging and _not_ in production components
   *
   * @deprecated since it should only be used for debugging and not production usecases, and this allows vscode to show a strikethrough through the symbol
   */
  _debuglog?: true | string;
}) => {
  // lookup the parent configuration
  const parent = useParentBlockConfiguration();

  // define cursor styles
  const stylesCursor: PrimitiveStyle = {
    ...(cursor ? { cursor } : undefined),
    userSelect: 'none', // ensure that text inside of pressable components is not selectable in web (e.g., for buttons, on double click, shouldn't highlight text)
  };

  // define the fill styles
  const stylesFill = getPrimitiveFillStyles({
    size: 'fill',
    parent: parent ?? null,
  });

  // define the fillpartes // TODO: add tests asap
  const fillConfig = castToBlockAxisFillConfiguration({
    size: castBlockSizeInputToBlockSize('fill'),
    parent: parent ?? null,
  });

  // define the merged styles
  const stylesMerged = {
    ...stylesCursor,
    ...stylesFill,
    ..._override,
  };

  // allow debug logging the relevant display constants if requested
  if (_debuglog)
    console.log(
      JSON.stringify(
        {
          parent,
          input: {
            fillConfig,
          },
          styleIn: {
            stylesCursor,
            stylesFill,
            _override,
          },
          styleOut: stylesMerged,
        },
        null,
        2,
      ),
    );

  // lookup current route
  const pathname = usePathname(); // TODO: decouple actionable from expo-router (e.g., ask context to pass in router object)

  // normalize the action; replace href w/ onpress on react.rn.native environments (since the <Link /> doesn't size correctly in native && hrefs are only useful in browser environments)
  const action = (() => {
    // on web, no sizing issues exist with the link component, so we can use as is
    if (Platform.OS === 'web') return actionInput;

    // if there's no href, the link wont be used anyway, so use as is
    if (!hasHrefLinkAction(actionInput)) return actionInput;

    // extract the href uri
    const hrefUri: string =
      typeof actionInput.href === 'string'
        ? actionInput.href
        : actionInput.href.uri;

    // if its a telephone href, then open the telephone href appropriately via expo-linking
    if (hrefUri.startsWith('tel'))
      return { onPress: () => Linking.openURL(hrefUri) };

    // !! todo vlad make this so external links open in new tab and do not affix params to the route
    // otherwise, replace the href with an onPress that pushes the route
    return {
      onPress: () => {
        // console.log('router.push', { hrefUri });
        // TODO: decouple actionable from expo-router (e.g., ask context to pass in router object)
        router.push({
          pathname: hrefUri as any,
          params: {
            prior: pathname, // declare the prior pathname explicitly
          },
        });
      },
    };
  })();

  // define the body of the primitive
  const body = (
    <PrimitivePressable
      disabled={disabled}
      onPress={hasOnPressAction(action) ? action.onPress : undefined}
      onLongPress={hasOnHoldAction(action) ? action.onHold : undefined}
      style={{
        ...stylesMerged,
      }}
    >
      {(event) => {
        // disabling eslint on the line below because eslint is mistaken here; this is not a callback, this is an anonymous component
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (event.pressed && feedback?.haptic)
            void invokeHapticFeedback(feedback.haptic);
        }, [event.pressed]);

        // return the new component
        return (
          <>
            <Animatable
              size="fill"
              animation={
                feedback.scale
                  ? { scale: event.pressed ? feedback.scale : 1 }
                  : {}
              }
            >
              <Block size="fill">
                {isAFunction(children) ? children(event) : children}
              </Block>
            </Animatable>
          </>
        );
      }}
    </PrimitivePressable>
  );

  // determine if this component is already within a primitive link (since on the web, errors are thrown on nested anchor tags)
  const parentPrimitiveLinkConfiguration =
    useParentPrimitiveLinkConfiguration();
  const isWithinPrimitiveLink = parentPrimitiveLinkConfiguration?.href;
  // todo: warn if parent link is diff then this link, since parent link will be used and this one will be ignored, due to no-nested-anchors limitation

  // wrap with a link if href, if not already nested within one
  if (hasHrefLinkAction(action) && !isWithinPrimitiveLink) {
    const hrefUri: string =
      typeof action.href === 'string' ? action.href : action.href.uri;
    if (Platform.OS !== 'web')
      throw new UnexpectedCodePathError(
        'we should have prevented this when casting from actionInput',
      );
    return (
      <PrimitiveLink
        href={{
          pathname: hrefUri as any,
          // params:
          //   action.trace?.prior === false ? undefined : { prior: pathname }, // todo: remove this prior trace from rheuse. rheuse is too low level for this usecase specific tactic
        }} // todo: figure out why not registered as static route
        target={
          typeof action.href === 'object' ? action.href.target : undefined
        }
        push={true}
        style={{
          // !: ensure that web _also_ has flexbox to ensure that link dimensions follow normal block layouts; defaults to inline on rn.web, flexbox on rn.native; if not explicitly set, this difference in defaults naturally messes things up
          display: 'flex',
          flexDirection: 'column',

          // TODO: allow basic size control input; for now, just fill
          ...getPrimitiveFillStyles({ size: 'fill', parent: parent ?? null }),
        }}
      >
        {body}
      </PrimitiveLink>
    ); // TODO: make an isomorphic link
  }

  // otherwise, the body has the action handler already
  return body;
};
