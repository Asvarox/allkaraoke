import { useEffect, useRef, useState } from 'react';
import { menuBack, menuEnter, menuNavigate } from '../SoundManager';
import useKeyboardHelp from './useKeyboardHelp';
import useKeyboardNav from './useKeyboardNav';

/**
 * todo: Bug: for some reason elementList is duplicated eg.
 * ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * But still works even with dynamic elements :shrugs:
 */
interface Options {
    enabled?: boolean;
    onBackspace?: () => void;
    backspaceHelp?: string;
}

export default function useKeyboard(options: Options = {}) {
    const { enabled = true, onBackspace, backspaceHelp } = options;

    const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
    const elementList = useRef<string[]>([]);
    const newElementList = useRef<string[]>([]);
    const actions = useRef<
        Record<
            string,
            {
                callback: () => void;
                label?: string;
            }
        >
    >({});
    const { setHelp, clearHelp } = useKeyboardHelp();

    useEffect(() => {
        if (enabled)
            setHelp({
                vertical: null,
                accept: actions.current[currentlySelected!]?.label ?? null,
                back: onBackspace ? backspaceHelp : undefined,
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

    useKeyboardNav(
        {
            onUpArrow: () => handleNavigation(-1),
            onDownArrow: () => handleNavigation(1),
            onEnter: handleEnter,
            onBackspace: handleBackspace,
        },
        enabled,
        [currentlySelected, elementList.current],
    );

    let defaultSelection = '';

    const register = (name: string, onActive: () => void, isDefault = false, help?: string) => {
        newElementList.current.push(name);
        if (onActive) actions.current[name] = { callback: onActive, label: help };

        if (isDefault) {
            defaultSelection = name;
        }

        return { focused: currentlySelected === name, onClick: onActive };
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
