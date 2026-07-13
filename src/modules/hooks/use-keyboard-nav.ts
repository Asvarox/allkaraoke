import { captureException } from '@sentry/react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import useKeyboard from '~/modules/hooks/use-keyboard';
import { menuBack, menuEnter, menuNavigate } from '~/modules/sound-manager';
import { HelpEntry } from '~/routes/keyboard-help/context';
import { ControlDescriptor, ControlInput } from '~/routes/keyboard-help/controls';
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
}

interface KeyboardAction {
  callback: () => void;
  label?: string;
  propName: string;
}

/** Structural equality for committed control sets, so unchanged sets don't trigger a state update. */
const sameControls = (a: ControlDescriptor[], b: ControlDescriptor[]) =>
  a.length === b.length && JSON.stringify(a) === JSON.stringify(b);

export default function useKeyboardNav(options: Options = {}, debug = false) {
  const { enabled = true, onBackspace, backspaceHelp = null, direction = 'vertical', additionalHelp = {} } = options;

  const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
  const elementList = useRef<string[]>([]);
  const newElementList = useRef<string[]>([]);
  const actions = useRef<Record<string, KeyboardAction>>({});

  // Mirror mode: descriptors collected from register({ control }) calls. `newControls` accumulates
  // during the current render; the committed set lives in STATE (not a ref) so the `help` memo
  // derives from the exact value React rendered with — a ref would go stale and flap classic/mirror.
  const newControls = useRef<ControlDescriptor[]>([]);
  const [committedControls, setCommittedControls] = useState<ControlDescriptor[]>([]);

  const currentlySelectedActionLabel = actions.current[currentlySelected!]?.label;
  const help = useMemo<HelpEntry>(
    () =>
      committedControls.length > 0
        ? {
            // Mirror mode — mutually exclusive with the arrow/accept fields.
            mode: 'mirror',
            back: onBackspace ? backspaceHelp : undefined,
            controls: committedControls,
            ...additionalHelp,
          }
        : {
            mode: 'classic',
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
    [currentlySelectedActionLabel, actions, backspaceHelp, direction, committedControls],
  );
  useKeyboardHelp(help, enabled);

  // Directly activate a mirrored control tapped on the remote mic — focus it and fire the exact
  // same callback used on-screen, so a phone tap === pressing Enter on the focused element.
  useEventEffect(events.remoteControlActivated, (name) => {
    if (!enabled) return;
    const action = actions.current[name];
    if (action) {
      setCurrentlySelected(name);
      action.callback();
      menuEnter.play();
    }
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

  const register = (
    name: string,
    onActive: (e?: Event) => void,
    help?: string,
    isDefault = false,
    {
      propName = 'onClick',
      disabled = false,
      control,
    }: { propName?: string; disabled?: boolean; control?: ControlInput } = {},
  ) => {
    if (disabled) {
      return { disabled, focused: false };
    }
    if (!newElementList.current.includes(name)) {
      newElementList.current.push(name);
    }

    if (onActive) actions.current[name] = { callback: onActive, label: help, propName };

    if (isDefault) {
      defaultSelection = name;
    }

    const focused = enabled && currentlySelected === name;

    // Collect a mirror descriptor when the caller (a Nav.* wrapper) supplied one. No `focused`
    // field — remote mics are touch-first, and omitting it also avoids republishing on host focus.
    if (control && !newControls.current.some((c) => c.name === name)) {
      newControls.current.push({ ...control, name });
    }

    return {
      focused,
      [propName]: onActive,
      $keyboardNavigationChangeFocus: handleNavigation,
      'data-test': name,
      ...(enabled ? { 'data-focused': focused, 'data-e2e-focused': focused } : {}),
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
    const collected = newControls.current;
    const fullCoverage = collected.length > 0 && collected.length === elementList.current.length;
    if (collected.length > 0 && !fullCoverage && process.env.NODE_ENV !== 'production') {
      captureException(
        new Error(
          `useKeyboardNav: partial mirror coverage (${collected.length}/${elementList.current.length} controls); falling back to arrows`,
        ),
      );
    }
    const nextControls = fullCoverage ? collected : [];
    newControls.current = [];
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
