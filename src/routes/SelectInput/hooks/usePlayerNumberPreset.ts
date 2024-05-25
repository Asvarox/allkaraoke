import PlayersManager, { MAX_PLAYERS } from 'modules/Players/PlayersManager';
import { useEffect } from 'react';

export default function usePlayerNumberPreset(targetPlayerCount: number, maxPlayerCount: number = MAX_PLAYERS) {
  useEffect(() => {
    PlayersManager.setMinPlayerNumber(targetPlayerCount);
    const players = PlayersManager.getPlayers();
    if (players.length > maxPlayerCount) {
      for (let i = players.length; i > maxPlayerCount; i--) {
        PlayersManager.removePlayer(players[i - 1].number);
      }
    } else if (players.length < targetPlayerCount) {
      const takenNumbers = PlayersManager.getPlayers().map((player) => player.number);
      const availableNumbers = Array.from(Array(MAX_PLAYERS).keys()).filter(
        (number) => !takenNumbers.includes(number as 0 | 1 | 2 | 3),
      );
      console.log(availableNumbers, takenNumbers);

      for (let i = players.length; i < targetPlayerCount; i++) {
        PlayersManager.addPlayer(availableNumbers.shift()! as 0 | 1 | 2 | 3);
      }
    }
  }, []);
}
