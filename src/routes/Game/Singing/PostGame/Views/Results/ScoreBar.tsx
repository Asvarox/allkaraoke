import styled from '@emotion/styled';

interface Props {
  score: number;
  maxScore: number;
  color: string;
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easing(x: number): number {
  return easeOutCubic(x);
}

function ScoreBar({ color, maxScore, score }: Props) {
  return (
    <SScoreBar
      style={{
        border: score === 0 ? 0 : undefined,
        width: `${easing(score / maxScore) * 24}%`,
        backgroundColor: color,
      }}
    />
  );
}

const SScoreBar = styled.div`
  background-image: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );
  transition: 1s;
  border-radius: 0.5rem;
  height: 100%;
  border: solid 0.1rem black;
  box-sizing: border-box;
`;

export default ScoreBar;
