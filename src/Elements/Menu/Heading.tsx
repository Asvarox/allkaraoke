import { ComponentProps } from 'react';
import completedAnimation from 'Elements/Menu/completed-animation.json';
import tuple from 'utils/tuple';
import Lottie from 'lottie-react';
import styled from '@emotion/styled';

export const Heading = styled.h1`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
`;

const SCompletedAnim = styled(Lottie)`
    display: inline-block;
    width: 10rem;
    height: 10rem;
    margin: -3rem -2rem -3rem -3rem;
`;

// needs to be a "stable" array - reference can't change
const completedAnimationSegment = tuple([0, 50]);

export const CompletedAnim = (
    props: Omit<ComponentProps<typeof SCompletedAnim>, 'initialSegment' | 'animationData' | 'loop'>,
) => (
    <SCompletedAnim
        {...props}
        initialSegment={completedAnimationSegment}
        animationData={completedAnimation}
        loop={false}
    />
);
