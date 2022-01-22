import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { MenuButton, MenuContainer } from '../../../../Elements/Menu';
import useKeyboardNav from '../../../../Hooks/useKeyboardNav';

interface Props {
    onResume: () => void;
    onExit: () => void;
}

enum Element {
    RESUME,
    EXIT,
}

export default function PauseMenu({ onResume, onExit }: Props) {
    const menuRef = useRef<null | HTMLButtonElement>(null);
    const [focusedElement, setFocusedEelement] = useState<number>(0);
    const enabledElements = [Element.RESUME, Element.EXIT];

    const isFocused = (elem: Element) => enabledElements[focusedElement] === elem;

    const handleNavigation = (i: number, elements: Element[]) => {
        setFocusedEelement((elements.length + i + focusedElement) % elements.length);
    };

    const handleEnter = () => {
        if (isFocused(Element.RESUME)) onResume();
        else if (isFocused(Element.EXIT)) onExit();
    };

    useEffect(() => {
        menuRef.current?.focus();
    }, [menuRef]);

    useKeyboardNav(
        {
            onUpArrow: () => handleNavigation(1, enabledElements),
            onDownArrow: () => handleNavigation(-1, enabledElements),
            onEnter: () => handleEnter(),
        },
        true,
        [enabledElements],
    );

    return (
        <Container>
            <MenuContainer>
                <MenuButton onClick={onResume} focused={isFocused(Element.RESUME)} ref={menuRef}>
                    Resume song
                </MenuButton>
                <MenuButton onClick={onExit} focused={isFocused(Element.EXIT)}>
                    Exit song
                </MenuButton>
            </MenuContainer>
        </Container>
    );
}

const Container = styled.div`
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;

    align-items: center;
    justify-content: center;
`;
