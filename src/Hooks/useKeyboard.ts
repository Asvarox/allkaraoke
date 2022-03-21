import { useEffect, useRef, useState } from 'react';
import useKeyboardNav from './useKeyboardNav';
import useMenuSound from './useMenuSound';

const click = require('../click.wav');

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

    useMenuSound(currentlySelected);

    const handleNavigation = (i: number) => {
        const currentIndex = currentlySelected ? elementList.current.indexOf(currentlySelected) : 0;

        setCurrentlySelected(elementList.current.at((currentIndex + i) % elementList.current.length) ?? null);
    };

    useKeyboardNav(
        {
            onUpArrow: () => handleNavigation(-1),
            onDownArrow: () => handleNavigation(1),
            onEnter: () => actions.current[currentlySelected!]?.(),
            onBackspace,
        },
        enabled,
        [currentlySelected, elementList.current],
    );

    const register = (name: string, onActive?: () => void) => {
        newElementList.current.push(name);
        if (onActive) actions.current[name] = onActive;

        return { focused: currentlySelected === name, onClick: onActive };
    };

    useEffect(() => {
        elementList.current = [...newElementList.current];
        newElementList.current.length = 0;

        if (
            elementList.current.length &&
            (currentlySelected === null || elementList.current.indexOf(currentlySelected) === -1)
        ) {
            setCurrentlySelected(elementList.current[0]);
        }
    }, [currentlySelected]);

    return {
        register,
    };
}
