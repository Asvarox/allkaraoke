interface Props {
  score: number;
}

export const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export default function ScoreText({ score }: Props) {
  return <>{formatter.format(score)}</>;
}
