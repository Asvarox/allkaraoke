import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';
import useLandingMenuVariant from '~/modules/utils/use-landing-menu-variant';

/**
 * Which main menu to render — the tiled one or the classic button column.
 *
 * One of the two sides of the `new_landing_menu` experiment (the other is `useNewLandingPage`);
 * the menu is new in the `menu` and `both` arms.
 *
 * Under e2e it's driven by an opt-in the spec sets instead (`enableNewMainMenu` in tests/helpers.ts),
 * the same way the leaderboard flag is: forcing it on would rewrite the menu under every existing
 * spec and every main-menu screenshot, and the control layout needs its own coverage either way.
 */
export default function useNewMainMenu(): boolean {
  const variant = useLandingMenuVariant();

  if (isE2E()) return !!globalThis.isE2ENewMainMenu;
  // Local development follows the new menu, matching how `useFeatureFlag` treats every other flag
  if (isDev()) return true;

  return variant === 'menu' || variant === 'both';
}
