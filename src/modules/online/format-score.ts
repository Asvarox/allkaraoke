/**
 * How a live score reads on the online screens — the leaderboard overlay and the pause menu, which
 * are on screen at the same moment (the menu sits over the leaderboard), so they must agree. Floored
 * and clamped, so a score never shows a fraction or, while snapshots are catching up, a negative.
 *
 * Deliberately NOT what the local game uses: `formatter` in
 * `game-overlay/components/score-text.tsx` rounds and follows the viewer's locale. Unifying the two
 * would change what local mode renders, so it's left alone for now.
 */
export const formatScore = (score: number) => Math.max(0, Math.floor(score)).toLocaleString('en');
