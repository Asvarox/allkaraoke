import styled from '@emotion/styled';
import { BackgroundStatic } from 'modules/Elements/LayoutWithBackground';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import { PropsWithChildren } from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import useAbsoluteFrame from 'videos/support/AbsoluteFrame/useAbsoluteFrame';
import { TransitionCircles } from 'videos/support/Components/TransitionCircles';

const BackgroundVariant = styled(BackgroundStatic)`
  &[data-red='true'] {
    background: linear-gradient(
      -45deg,
      ${colorSets.blue.text},
      ${colorSets.red.text},
      ${colorSets.red.stroke},
      ${colorSets.blue.stroke}
    );
    background-size: 400% 400%;
  }
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
  const { durationInFrames } = useVideoConfig();
  const frame = useAbsoluteFrame();

  const movement = easeInOutSine(frame / (durationInFrames / 2));
  const bgPosition = interpolate(movement, [0, 1], [0, 100]);

  return (
    <>
      {transition && <TransitionCircles delay={delay} duration={30} id={id} />}
      <BackgroundVariant
        data-theme="regular"
        data-id={id}
        data-red={color === 'red'}
        style={{
          backgroundPosition: `${bgPosition}% 50%`,
          clipPath: transition ? `url(#${id})` : undefined,
        }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </BackgroundVariant>
    </>
  );
};
