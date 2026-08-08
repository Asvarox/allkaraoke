import { backgroundTheme } from '~/modules/elements/layout-with-background';

// One name per player color set, up to MAX_SUPPORTED_PLAYERS (6) — same shape as `PlayerColorSets`
// in `styles.ts`. Screens that offer fewer colors render a prefix of it instead of keeping a
// shorter table of their own.
type PlayerColorNames = [string, string, string, string, string, string];

/** Human-readable name of each player color, in the same order as `colorThemes` in `styles.ts` —
 * entry N names `styles.colors.players[N]`. Colors are picked by name (the buttons say "Blue", not
 * a swatch), so this has to be kept in step with the color sets whenever a theme is retouched. */
export const PLAYER_COLOR_NAMES: Record<backgroundTheme, PlayerColorNames> = {
  regular: ['Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Orange'],
  christmas: ['Green', 'Red', 'Blue', 'Gold', 'Violet', 'Silver'],
  eurovision: ['Blue', 'Red', 'Green', 'Pink', 'Violet', 'Orange'],
  halloween: ['Orange', 'Violet', 'Red', 'Green', 'Blue', 'Gold'],
};
