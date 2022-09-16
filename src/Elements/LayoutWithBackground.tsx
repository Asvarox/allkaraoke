import React from 'react';
import { blueFill, blueStroke, redStroke } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import styled from 'styled-components';

const Background = styled.div`
    z-index: -1;
    top: 0;
    position: fixed;
    background: white;

    background: linear-gradient(-45deg, ${redStroke()}, ${blueFill()}, ${blueStroke()}, ${redStroke()});
    background-size: 400% 400%;
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

    width: 100%;
    height: 100%;
`;

export default function LayoutWithBackground({ children }: React.PropsWithChildren) {
    return (
        <>
            <Background />
            {children}
        </>
    );
}
