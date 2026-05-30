interface Props {
  score: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export default function ScoreText({ score }: Props) {
  return <>{formatter.format(score)}</>;
}
