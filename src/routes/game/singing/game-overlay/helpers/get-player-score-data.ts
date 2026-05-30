type playerNum = 0 | 1 | 2 | 3;
type score = number;
export default function getPlayerScoreData(scores: [playerNum, score][], playerNumber: playerNum) {
  // sort by highest score first
  scores.sort((a, b) => b[1] - a[1]);
  const score = scores.find(([number]) => number === playerNumber) ?? [playerNumber, -1];
  const place = scores.findIndex(([number]) => number === playerNumber);
  const isExAequo = scores.filter(([, pScore]) => pScore === score[1]).length > 1;

  const isFirst = !isExAequo && place === 0;

  return {
    score: score[1],
    isFirst,
  };
}
