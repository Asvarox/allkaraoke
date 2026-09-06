/**
 * The view-transition names the landing page and the tiled main menu share, so that navigating from
 * one to the other morphs the blocks that mean the same thing instead of cross-fading the screen.
 *
 * They live here rather than inline in either screen because a name only does anything when BOTH
 * sides spell it identically — a typo on one side is a silent fade, not an error. The pairs are:
 *
 * - `SING_A_SONG` — the landing page's main card ↔ the menu's "Sing a song" tile
 * - `SING_ONLINE` — the landing page's online strip ↔ the menu's "Sing Online" tile
 * - `LEADERBOARD` — the global board, which is the same panel on both screens
 * - `TILES[n]` — the landing page's stat tiles ↔ the menu's second tile row, matched by position
 *
 * Written out as whole class strings (and not built from a template) because Tailwind finds
 * arbitrary utilities by scanning the source for the literal text.
 *
 * Only the tiled menu carries these: the classic menu renders the board twice (a desktop rail and a
 * narrow-screen copy), and two elements sharing a view-transition name skips the transition.
 */
export const MenuViewTransition = {
  SING_A_SONG: '[view-transition-name:menu-sing-a-song]',
  SING_ONLINE: '[view-transition-name:menu-sing-online]',
  LEADERBOARD: '[view-transition-name:menu-leaderboard]',
  TILES: [
    '[view-transition-name:menu-tile-0]',
    '[view-transition-name:menu-tile-1]',
    '[view-transition-name:menu-tile-2]',
    '[view-transition-name:menu-tile-3]',
  ],
} as const;
