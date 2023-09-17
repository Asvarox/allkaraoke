import PlayersManager from 'Players/PlayersManager';
import { useEffect } from 'react';

export default function usePlayerNumberPreset(targetPlayerCount: number) {
  useEffect(() => {
    PlayersManager.setMinPlayerNumber(targetPlayerCount);
    const playerCount = PlayersManager.getPlayers().length;
    if (playerCount > targetPlayerCount) {
      for (let i = playerCount; i > 1; i--) {
        PlayersManager.removePlayer(i - 1);
      }
    } else if (playerCount < targetPlayerCount) {
      const takenNumbers = PlayersManager.getPlayers().map((player) => player.number);
      const availableNumbers = Array.from(Array(PlayersManager.MAX_PLAYERS).keys()).filter(
        (number) => !takenNumbers.includes(number),
      );

      for (let i = playerCount; i < targetPlayerCount; i++) {
        PlayersManager.addPlayer(availableNumbers.shift()!);
      }
    }
  }, []);
}
