import { Setting } from '~/routes/settings/settings-state';

export type SharingDecision = 'always' | 'never';

/**
 * The player's standing decision about the global leaderboard.
 *
 * - `null` — undecided. The prompt opens after every qualifying song.
 * - `'always'` — the high-scores step arms the score instead of asking; it goes up when the player
 *   moves on to the next song.
 * - `'never'` — the prompt never opens again. The high-scores step keeps a way back in.
 */
export const LeaderboardSharingSetting = new Setting<SharingDecision | null>('leaderboard-sharing', null);
