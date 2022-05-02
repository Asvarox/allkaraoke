import useKeyboard from 'hooks/useKeyboard';
import { useEffect, useRef, useState } from 'react';
import { HelpEntry } from 'Scenes/KeyboardHelp/Context';
import { menuBack, menuEnter, menuNavigate } from 'SoundManager';
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

export default function useKeyboardNav(options: Options = {}) {
    const { enabled = true, onBackspace, backspaceHelp = null, direction = 'vertical', additionalHelp = {} } = options;

    const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
    const elementList = useRef<string[]>([]);
    const newElementList = useRef<string[]>([]);
    const actions = useRef<Record<string, KeyboardAction>>({});
    const { setHelp, clearHelp } = useKeyboardHelp();

    useEffect(() => {
        if (enabled)
            setHelp({
                [direction]: null,
                accept: actions.current[currentlySelected!]?.label ?? null,
                back: onBackspace ? backspaceHelp : undefined,
                ...additionalHelp,
            });
        return clearHelp;
    }, [enabled, currentlySelected, actions]);

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

    const handleNavigation = (i: number) => {
        const currentIndex = currentlySelected ? elementList.current.indexOf(currentlySelected) : 0;
        menuNavigate.play();

        setCurrentlySelected(elementList.current.at((currentIndex + i) % elementList.current.length) ?? null);
    };

    useKeyboard(
        {
            [direction === 'vertical' ? 'onUpArrow' : 'onLeftArrow']: () => handleNavigation(-1),
            [direction === 'vertical' ? 'onDownArrow' : 'onRightArrow']: () => handleNavigation(1),
            onEnter: handleEnter,
            onBackspace: handleBackspace,
        },
        enabled,
        [currentlySelected, elementList.current],
    );

    let defaultSelection = '';

    const register = (
        name: string,
        onActive: () => void,
        help?: string,
        isDefault = false,
        { propName = 'onClick' } = {},
    ) => {
        newElementList.current.push(name);
        if (onActive) actions.current[name] = { callback: onActive, label: help, propName };

        if (isDefault) {
            defaultSelection = name;
        }

        return { focused: enabled && currentlySelected === name, [propName]: onActive };
    };

    useEffect(() => {
        elementList.current = [...newElementList.current];
        newElementList.current.length = 0;

        if (
            elementList.current.length &&
            (currentlySelected === null || elementList.current.indexOf(currentlySelected) === -1)
        ) {
            setCurrentlySelected(defaultSelection || elementList.current[0]);
        }
    });

    return {
        register,
    };
}
