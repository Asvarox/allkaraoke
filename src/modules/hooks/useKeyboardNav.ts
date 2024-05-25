import { menuBack, menuEnter, menuNavigate } from 'modules/SoundManager';
import useKeyboard from 'modules/hooks/useKeyboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HelpEntry } from 'routes/KeyboardHelp/Context';
import useKeyboardHelp from './useKeyboardHelp';

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

export default function useKeyboardNav(options: Options = {}, debug = false) {
  const { enabled = true, onBackspace, backspaceHelp = null, direction = 'vertical', additionalHelp = {} } = options;

  const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
  const elementList = useRef<string[]>([]);
  const newElementList = useRef<string[]>([]);
  const actions = useRef<Record<string, KeyboardAction>>({});

  const currentlySelectedActionLabel = actions.current[currentlySelected!]?.label;
  const help = useMemo(
    () => ({
      [direction]: null,
      accept: currentlySelectedActionLabel ?? null,
      back: onBackspace ? backspaceHelp : undefined,
      ...additionalHelp,
    }),
    [currentlySelectedActionLabel, actions, backspaceHelp, direction],
  );
  useKeyboardHelp(help, enabled);

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
    { propName = 'onClick', disabled = false } = {},
  ) => {
    if (disabled) {
      return { disabled, focused: false };
    }
    newElementList.current.push(name);
    if (onActive) actions.current[name] = { callback: onActive, label: help, propName };

    if (isDefault) {
      defaultSelection = name;
    }

    const focused = enabled && currentlySelected === name;

    return {
      focused,
      [propName]: onActive,
      keyboardNavigationChangeFocus: handleNavigation,
      'data-test': name,
      ...(enabled ? { 'data-focused': focused } : {}),
    };
  };

  useEffect(() => {
    document
      .querySelector(`[data-test="${currentlySelected}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentlySelected]);

  useEffect(() => {
    let newElements = newElementList.current.filter((e) => !elementList.current.includes(e));
    debug && newElements.length && console.log('new elements', newElements);
    elementList.current = [...newElementList.current];
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
