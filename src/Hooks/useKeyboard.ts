import { useEffect, useRef, useState } from 'react';
import { menuBack, menuEnter, menuNavigate } from '../SoundManager';
import useKeyboardNav from './useKeyboardNav';

/**
 * todo: Bug: for some reason elementList is duplicated eg.
 * ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * But still works even with dynamic elements :shrugs:
 */
export default function useKeyboard(enabled = true, onBackspace?: () => void) {
    const elementList = useRef<string[]>([]);
    const newElementList = useRef<string[]>([]);
    const actions = useRef<Record<string, () => void>>({});

    const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);

    const handleEnter = () => {
        actions.current[currentlySelected!]?.();
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

    const register = (name: string, onActive: () => void, isDefault = false) => {
        newElementList.current.push(name);
        if (onActive) actions.current[name] = onActive;

        if (isDefault) {
            defaultSelection = name;
        }

        return { focused: currentlySelected === name, onClick: onActive };
    };

    useEffect(() => {
        elementList.current = [...newElementList.current];
        newElementList.current.length = 0;

        // console.log(elementList, currentlySelected, defaultSelection);
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
