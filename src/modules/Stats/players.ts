import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from '~/modules/hooks/players/consts';

import events from '~/modules/GameEvents/GameEvents';
import PlayersManager from '~/modules/Players/PlayersManager';
import { isNonNull } from '~/modules/utils/isNonNull';
import storage from '~/modules/utils/storage';

events.songStarted.subscribe((_, singSetup) => {
  let currentNames = JSON.parse(storage.session.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) || [];
  const thisPlayNames = singSetup.players
    .map(({ number }) => PlayersManager.getPlayer(number))
    .filter(isNonNull)
    .map((player) => player.getName().trim());

  const newNamesSet = [...currentNames].concat(...thisPlayNames);
  currentNames = [...new Set(newNamesSet)].filter(Boolean);

  storage.session.setItem(PLAYER_NAMES_SESSION_STORAGE_KEY, JSON.stringify(currentNames));
  storage.session.setItem(PREVIOUS_PLAYER_NAMES_STORAGE_KEY, JSON.stringify(thisPlayNames));
});

events.songScoreUpdated.subscribe((_, __, newName) => {
  let currentNames = JSON.parse(storage.session.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) || [];

  const newNamesSet = [...currentNames].concat(newName);
  currentNames = [...new Set(newNamesSet)].filter(Boolean);

  storage.session.setItem(PLAYER_NAMES_SESSION_STORAGE_KEY, JSON.stringify(currentNames));
});
