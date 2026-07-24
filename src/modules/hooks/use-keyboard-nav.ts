import { captureException } from '@sentry/react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import useKeyboard from '~/modules/hooks/use-keyboard';
import { menuBack, menuEnter, menuNavigate } from '~/modules/sound-manager';
import { HelpEntry } from '~/routes/keyboard-help/context';
import { ControlDescriptor, ControlInput, RemoteButtonIcon } from '~/routes/keyboard-help/controls';

import useKeyboardHelp from './use-keyboard-help';

/**
 * todo: Bug: for some reason elementList is duplicated eg.
 * ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * But still works even with dynamic elements :shrugs:
 */
interface Options {
  enabled?: boolean;
  onBackspace?: () => void;
  backspaceHelp?: string | null;
  direction?: 'horizontal' | 'vertical';
  additionalHelp?: HelpEntry;
  /** Screen name mirrored to the remote mic, shown as the header above its keyboard (mirror mode). */
  title?: string;
  /** Glyph shown beside `title` on the remote; defaults to a generic keyboard icon. */
  titleIcon?: RemoteButtonIcon;
}

interface KeyboardAction {
  callback: () => void;
  label?: string;
  propName: string;
}

/** Applies a new value pushed from the remote to a value-bearing control (e.g. a text field). */
type ValueCallback = (value: string) => void;

/** Structural equality for committed control sets, so unchanged sets don't trigger a state update. */
const sameControls = (a: ControlDescriptor[], b: ControlDescriptor[]) =>
  a.length === b.length && JSON.stringify(a) === JSON.stringify(b);

export default function useKeyboardNav(options: Options = {}, debug = false) {
  const {
    enabled = true,
    onBackspace,
    backspaceHelp = null,
    direction = 'vertical',
    additionalHelp = {},
    title,
    titleIcon,
  } = options;

  const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
  const elementList = useRef<string[]>([]);
  const newElementList = useRef<string[]>([]);
  const actions = useRef<Record<string, KeyboardAction>>({});
  // Value callbacks for value-bearing controls (e.g. text fields), keyed by register() name. Kept
  // separate from `actions` because they take the remote-supplied value rather than firing a tap.
  // Staged per render (`newValueActions`) and swapped in wholesale below, rather than accumulated:
  // a value edit can arrive from the phone long after the user typed it, and the screen may have
  // changed in between — rebuilding the registry each render means a control that is gone (or became
  // disabled, which returns from `register` before staging) can no longer be written to.
  const valueActions = useRef<Record<string, ValueCallback>>({});
  const newValueActions = useRef<Record<string, ValueCallback>>({});
  // Cleared at the START of every render (not in the effect below): React can render without flushing
  // our effect, and a buffer cleared only on commit would carry that render's entries into the next
  // one — resurrecting a control that has since disappeared. Assigning a fresh object also means the
  // set already handed to `valueActions` is never mutated afterwards.
  newValueActions.current = {};

  // Mirror mode: descriptors collected from register({ control }) calls during the current render;
  // the committed set lives in STATE (not a ref) so the `help` memo derives from the exact value
  // React rendered with — a ref would go stale and flap classic/mirror.
  const newControls = useRef<ControlDescriptor[]>([]);
  // Names registered with `remoteOnly` — they live in `newControls` (so they keep the author's
  // ordering on the phone) but have no on-screen element, so they're subtracted from the coverage
  // count below. A Set, not a counter, so a double render can't inflate it.
  const remoteOnlyNames = useRef<Set<string>>(new Set());
  // Same render-start reset as `newValueActions`, and for the same reason — but here it also fixes
  // ORDER: register() de-duplicates by name, so entries left over from a render whose effect never
  // flushed would pin the control order to whatever that earlier render happened to see, which may
  // not be the on-screen order. Rebuilding per render makes the mirrored list always follow JSX
  // order. Fresh instances also mean the set already handed to `committedControls` is never mutated.
  newControls.current = [];
  remoteOnlyNames.current = new Set();
  const [committedControls, setCommittedControls] = useState<ControlDescriptor[]>([]);

  const currentlySelectedActionLabel = actions.current[currentlySelected!]?.label;
  const help = useMemo<HelpEntry>(
    () =>
      committedControls.length > 0
        ? {
            // Mirror mode — mutually exclusive with the arrow/accept fields.
            mode: 'mirror',
            title,
            icon: titleIcon,
            back: onBackspace ? backspaceHelp : undefined,
            controls: committedControls,
            ...additionalHelp,
          }
        : {
            mode: 'classic',
            title,
            [direction]: null,
            accept: currentlySelectedActionLabel ?? null,
            back: onBackspace ? backspaceHelp : undefined,
            ...additionalHelp,
          },
    // NOTE: `onBackspace` and `additionalHelp` are intentionally excluded — callers pass fresh values
    // each render (a new `() => …` and object literal), so including them would recompute `help`
    // every render and, via updateKeyboard, spin an infinite re-render loop. Their content is static.
    // `actions` is a stable ref, kept in the list for readability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentlySelectedActionLabel, actions, backspaceHelp, direction, committedControls, title, titleIcon],
  );
  useKeyboardHelp(help, enabled);

  // Directly activate a mirrored control tapped on the remote mic — focus it and fire the exact
  // same callback used on-screen, so a phone tap === pressing Enter on the focused element.
  useEventEffect(events.remoteControlActivated, (name) => {
    if (!enabled) return;
    const action = actions.current[name];
    if (action) {
      // Remote-only controls have no on-screen element, so there's nothing to focus (and focusing a
      // name that isn't in `elementList` would strand arrow navigation).
      if (elementList.current.includes(name)) setCurrentlySelected(name);
      action.callback();
      menuEnter.play();
    }
  });

  // Apply a value edited on the remote mic to the matching value control (e.g. a text field). No
  // sound and no focus change — it's a continuous edit, not a discrete activation.
  useEventEffect(events.remoteControlValueChanged, (name, value) => {
    if (!enabled) return;
    valueActions.current[name]?.(value);
  });

  const handleEnter = () => {
    actions.current[currentlySelected!]?.callback();
    menuEnter.play();
  };

  const handleBackspace = () => {
    if (onBackspace) {
      menuBack.play();
      onBackspace();
    }
  };

  const handleNavigation = (direction: -1 | 1) => {
    const currentIndex = currentlySelected ? elementList.current.indexOf(currentlySelected) : 0;
    menuNavigate.play();

    setCurrentlySelected(elementList.current.at((currentIndex + direction) % elementList.current.length) ?? null);
  };

  useKeyboard(
    {
      [direction === 'vertical' ? 'up' : 'left']: () => handleNavigation(-1),
      [direction === 'vertical' ? 'down' : 'right']: () => handleNavigation(1),
      accept: handleEnter,
      back: handleBackspace,
    },
    enabled,
    [currentlySelected, elementList.current],
  );

  let defaultSelection = '';

  // The nearest registered (non-disabled, non-decorative) neighbours of the current selection, by
  // registration order — not the wrap-around order `handleNavigation` uses, since a menu's "glow"
  // effect (Menu.tsx / index.css `menu-neighbour-glow`) shouldn't visually link the last item back
  // to the first. `null` at either end of the list, same as `elementList.current`'s own boundaries.
  const selectedIndex = currentlySelected ? elementList.current.indexOf(currentlySelected) : -1;
  const previousFocusableName = selectedIndex > 0 ? elementList.current[selectedIndex - 1] : null;
  const nextFocusableName =
    selectedIndex !== -1 && selectedIndex < elementList.current.length - 1
      ? elementList.current[selectedIndex + 1]
      : null;

  const register = (
    name: string,
    onActive: (e?: Event) => void,
    help?: string,
    isDefault = false,
    {
      propName = 'onClick',
      disabled = false,
      control,
      remoteOnly = false,
      onValueChange,
    }: {
      propName?: string;
      disabled?: boolean;
      control?: ControlInput;
      remoteOnly?: boolean;
      /** For value controls (e.g. `text`): applies a value pushed from the remote mic. */
      onValueChange?: ValueCallback;
    } = {},
  ) => {
    if (disabled) {
      return { disabled, focused: false };
    }

    if (onActive) actions.current[name] = { callback: onActive, label: help, propName };
    if (onValueChange) newValueActions.current[name] = onValueChange;

    // Collect a mirror descriptor when the caller (a Nav.* wrapper) supplied one. No `focused`
    // field — remote mics are touch-first, and omitting it also avoids republishing on host focus.
    if (control && !newControls.current.some((c) => c.name === name)) {
      newControls.current.push({ ...control, name });
      if (remoteOnly) remoteOnlyNames.current.add(name);
    }

    // A remote-only control exists solely on the phone (e.g. a "back" affordance the screen doesn't
    // show), so it never joins the on-screen navigation list and has no props to hand back.
    if (remoteOnly) {
      return { disabled: false, focused: false };
    }

    if (!newElementList.current.includes(name)) {
      newElementList.current.push(name);
    }

    if (isDefault) {
      defaultSelection = name;
    }

    const focused = enabled && currentlySelected === name;

    return {
      focused,
      [propName]: onActive,
      $keyboardNavigationChangeFocus: handleNavigation,
      'data-test': name,
      ...(enabled
        ? {
            'data-focused': focused,
            'data-e2e-focused': focused,
            'data-next-focusable': name === nextFocusableName,
            'data-previous-focusable': name === previousFocusableName,
          }
        : {}),
    };
  };

  useEffect(() => {
    document
      .querySelector(`[data-test="${currentlySelected}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentlySelected]);

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const newElements = newElementList.current.filter((e) => !elementList.current.includes(e));
    debug && newElements.length && console.log('new elements', newElements);
    elementList.current = [...newElementList.current];

    // Mirror mode is all-or-nothing: only mirror when EVERY navigable element supplied a
    // descriptor. A partial set falls back to classic arrows so the phone is never misleading.
    // Remote-only descriptors are excluded from the tally — they have no on-screen element to cover.
    const collected = newControls.current;
    const screenControls = collected.length - remoteOnlyNames.current.size;
    const fullCoverage = collected.length > 0 && screenControls === elementList.current.length;
    if (collected.length > 0 && !fullCoverage && process.env.NODE_ENV !== 'production') {
      captureException(
        new Error(
          `useKeyboardNav: partial mirror coverage (${screenControls}/${elementList.current.length} controls); falling back to arrows`,
        ),
      );
    }
    const nextControls = fullCoverage ? collected : [];
    // Swap in this render's value callbacks, dropping any control that is no longer registered.
    valueActions.current = newValueActions.current;
    // Only update state when the committed set actually changed — an empty→empty no-op keeps classic
    // screens from re-registering (which would re-order them ahead of others in `.at(-1)` selection).
    setCommittedControls((prev) => (sameControls(prev, nextControls) ? prev : nextControls));

    newElementList.current.length = 0;

    if (!elementList.current.length) return;
    if (
      currentlySelected === null ||
      elementList.current.indexOf(currentlySelected) === -1 ||
      newElements.includes(defaultSelection)
    ) {
      setCurrentlySelected(defaultSelection || elementList.current[0]);
    }
  });

  const focusElement = (name: string) => {
    if (elementList.current.includes(name)) setCurrentlySelected(name);
  };

  return {
    focusElement,
    focused: currentlySelected,
    register,
  };
}

export type RegisterFunc = ReturnType<typeof useKeyboardNav>['register'];

/**
 * Shares a screen's `register` with its subtree so controls (and nested components) don't need it
 * drilled through props. Provide it with `<KeyboardNavContext value={register}>` and read it with
 * `useRegister()`. Mirrors the `KeyboardHelpContext` pattern used elsewhere.
 */
export const KeyboardNavContext = createContext<RegisterFunc | null>(null);

/** Returns the nearest provided `register`. `optional` returns null instead of throwing when absent. */
export function useRegister(optional = false): RegisterFunc {
  const register = useContext(KeyboardNavContext);
  if (!register && !optional) {
    throw new Error('useRegister must be used within a <KeyboardNavContext> (from useKeyboardNav)');
  }
  return register as RegisterFunc;
}
