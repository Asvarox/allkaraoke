import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { PropsWithChildren } from 'react';
import { BackgroundStatic } from 'Elements/LayoutWithBackground';
import styled from '@emotion/styled';
import { blueFill, blueStroke, redFill, redStroke } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { TransitionCircles } from 'videos/support/Components/TransitionCircles';
import useAbsoluteFrame from 'videos/support/AbsoluteFrame/useAbsoluteFrame';

const BackgroundVariant = styled(BackgroundStatic)<{ red?: boolean }>`
    ${(props) =>
        props.red &&
        `
            background: linear-gradient(-45deg, ${blueFill()}, ${redFill()}, ${redStroke()}, ${blueStroke()});
            background-size: 400% 400%;
    `};
    position: absolute;
`;

function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

interface Props extends PropsWithChildren {
    transition?: boolean;
    delay?: number;
    color: 'red' | 'blue';
    id: string;
}

export const Scene: React.FC<Props> = ({ children, delay = 0, transition = true, color, id }) => {
    const { durationInFrames, fps } = useVideoConfig();
    const frame = useAbsoluteFrame();

    const movement = easeInOutSine(frame / (durationInFrames / 2));
    const bgPosition = interpolate(movement, [0, 1], [0, 100]);

    return (
        <>
            {transition && <TransitionCircles delay={delay} duration={30} id={id} />}
            <BackgroundVariant
                data-id={id}
                red={color === 'red'}
                style={{
                    backgroundPosition: `${bgPosition}% 50%`,
                    clipPath: transition ? `url(#${id})` : undefined,
                }}>
                <AbsoluteFill>{children}</AbsoluteFill>
            </BackgroundVariant>
        </>
    );
};
