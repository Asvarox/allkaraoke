import range from 'modules/utils/range';
import { SVGProps, useMemo } from 'react';
import { Easing, interpolate, random, useCurrentFrame } from 'remotion';

interface TransitionCircleProps extends SVGProps<SVGCircleElement> {
  delay: number;
  duration: number;
}
export const TransitionSVGCircle: React.FC<TransitionCircleProps> = ({ delay, duration, ...restProps }) => {
  const frame = useCurrentFrame();

  const scale2 = interpolate(Math.max(0, frame - delay), [0, duration], [0, 1], {
    easing: Easing.cubic,
    extrapolateRight: 'clamp',
  });

  return <circle {...restProps} r={`${scale2 * 60}%`} />;
};

interface Props extends TransitionCircleProps {
  id: string;
}

const CIRCLE_NUM = 10;

const daySeed = new Date().toDateString();

export const TransitionCircles: React.FC<Props> = ({ delay, duration, id }) => {
  const randomizedCircles = useMemo(
    () =>
      range(CIRCLE_NUM).map((a, i) => {
        return {
          x: random(`${daySeed}-${id}-random-x-${i}`),
          y: random(`${daySeed}-${id}-random-y-${i}`),
          delay: random(`${daySeed}-${id}-random-delay-${i}`),
        };
      }),
    [],
  );

  return (
    <>
      <svg width="100%" height="100%">
        <defs>
          <clipPath id={id}>
            {randomizedCircles.map((circle, index) => (
              <TransitionSVGCircle
                key={index}
                cx={`${10 + circle.x * 80}%`}
                cy={`${10 + circle.y * 80}%`}
                delay={delay}
                duration={duration}
              />
            ))}
          </clipPath>
        </defs>
      </svg>
    </>
  );
};
