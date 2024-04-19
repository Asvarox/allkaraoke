import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from 'hooks/players/consts';

import events from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';
import { isNonNull } from 'utils/isNonNull';

events.songStarted.subscribe((_, singSetup) => {
  let currentNames = JSON.parse(window.sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) || [];
  const thisPlayNames = singSetup.players
    .map(({ number }) => PlayersManager.getPlayer(number))
    .filter(isNonNull)
    .map((player) => player.getName().trim());

  const newNamesSet = [...currentNames].concat(...thisPlayNames);
  currentNames = [...new Set(newNamesSet)].filter(Boolean);

  window.sessionStorage.setItem(PLAYER_NAMES_SESSION_STORAGE_KEY, JSON.stringify(currentNames));
  window.sessionStorage.setItem(PREVIOUS_PLAYER_NAMES_STORAGE_KEY, JSON.stringify(thisPlayNames));
});

events.songScoreUpdated.subscribe((_, __, newName) => {
  let currentNames = JSON.parse(window.sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) || [];

  const newNamesSet = [...currentNames].concat(newName);
  currentNames = [...new Set(newNamesSet)].filter(Boolean);

  window.sessionStorage.setItem(PLAYER_NAMES_SESSION_STORAGE_KEY, JSON.stringify(currentNames));
});
