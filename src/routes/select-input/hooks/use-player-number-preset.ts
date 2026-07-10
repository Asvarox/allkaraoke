import { PlayerNumber } from '~/modules/players/player-number';
import { useEffect } from 'react';
import PlayersManager, { MAX_PLAYERS } from '~/modules/players/players-manager';

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
        (number) => !takenNumbers.includes(number as PlayerNumber),
      );
      console.log(availableNumbers, takenNumbers);

      for (let i = players.length; i < targetPlayerCount; i++) {
        PlayersManager.addPlayer(availableNumbers.shift()! as PlayerNumber);
      }
    }
  }, []);
}
