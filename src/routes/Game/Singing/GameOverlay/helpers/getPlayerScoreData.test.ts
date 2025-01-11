import getPlayerScoreData from 'routes/Game/Singing/GameOverlay/helpers/getPlayerScoreData';

describe('getPlayerScoreData', () => {
  it('should return isFirst = true if the player has the biggest score', () => {
    const scores: [0 | 1 | 2 | 3, number][] = [
      [3, 1],
      [2, 5],
      [1, 3],
      [0, 10],
    ];
    const result = getPlayerScoreData(scores, 0);
    expect(result.score).toBe(10);
    expect(result.isFirst).toBe(true);
  });
  it('should return isFirst = false if the player has not the biggest score', () => {
    const scores: [0 | 1 | 2 | 3, number][] = [
      [3, 1],
      [2, 5],
      [1, 3],
      [0, 10],
    ];
    const result = getPlayerScoreData(scores, 2);
    expect(result.score).toBe(5);
    expect(result.isFirst).toBe(false);
  });
  it('should return isFirst = false if there are 2 players with the biggest score', () => {
    const scores: [0 | 1 | 2 | 3, number][] = [
      [3, 1],
      [2, 5],
      [1, 10],
      [0, 10],
    ];
    const result = getPlayerScoreData(scores, 0);
    expect(result.score).toBe(10);
    expect(result.isFirst).toBe(false);
  });
});
