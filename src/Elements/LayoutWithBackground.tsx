import styled from '@emotion/styled';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { blueFill, blueStroke, redStroke } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

export const BackgroundContext = createContext({
    visible: true,
    setVisibility: (visible: boolean): void => undefined,
});

export const useBackground = (shouldBeVisible: boolean) => {
    const background = useContext(BackgroundContext);
    useEffect(() => {
        if (shouldBeVisible !== background.visible) {
            background.setVisibility(shouldBeVisible);
        }
    }, [shouldBeVisible, background.visible, background.setVisibility]);
};

export default function LayoutWithBackgroundProvider({ children }: React.PropsWithChildren) {
    const [visible, setVisible] = useState(true);

    const setVisibility = useCallback(
        (newValue: boolean) => {
            setVisible(newValue);
        },
        [setVisible],
    );

    return (
        <BackgroundContext.Provider value={{ visible, setVisibility }}>
            {visible && <Background />}
            {children}
        </BackgroundContext.Provider>
    );
}

export const BackgroundStatic = styled.div`
    background-color: white;
    background-image: linear-gradient(-45deg, ${redStroke()}, ${blueFill()}, ${blueStroke()}, ${redStroke()});
    background-size: 400% 400%;

    width: 100%;
    height: 100%;
`;

const Background = styled(BackgroundStatic)`
    z-index: -1;
    top: 0;
    position: fixed;
    view-transition-name: background;

    animation: gradient 15s ease infinite;

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
`;
