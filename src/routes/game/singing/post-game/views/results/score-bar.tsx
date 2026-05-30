import clsx from 'clsx';

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
  const rawProgress = maxScore > 0 ? score / maxScore : 0;
  const progress = Math.max(0, Math.min(1, rawProgress));

  return (
    <div
      className={clsx(
        'box-border h-full rounded-lg transition-all duration-1000',
        score === 0 ? 'border-0' : 'border border-black',
      )}
      style={{
        width: `${easing(progress) * 24}%`,
        backgroundColor: color,
        backgroundImage:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.17) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0.18) 51%, rgba(0, 0, 0, 0.18) 100%)',
      }}
    />
  );
}

export default ScoreBar;
