import createPersistedState from 'use-persisted-state';

import isDev from '~/modules/utils/is-dev';

/** Indexed by the stored difficulty, which is a sing setup's `tolerance - 1`. */
export const difficultyNames = ['Hard', 'Medium', 'Easy'];

if (isDev()) {
  difficultyNames.push('Debug 4');
  difficultyNames.push('Debug 5');
  difficultyNames.push('Debug 6');
}

/** The difficulty picked in the song preview — by its switcher, or by the leaderboard's tabs beside it. */
export const useDifficultySetting = createPersistedState<number>('song_settings-tolerance-v2');
