import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';
import useLandingMenuVariant from '~/modules/utils/use-landing-menu-variant';

/**
 * Which landing page to render — the card grid or the classic one-column pitch.
 *
 * One of the two sides of the `new_landing_menu` experiment (the other is `useNewMainMenu`); the
 * landing page is new in the `landing` and `both` arms.
 *
 * Under e2e it's driven by an opt-in the spec sets instead (`enableNewLandingPage` in
 * tests/helpers.ts) — same reasoning as the menu: the landing page is the entry point of nearly
 * every spec, and both sides need screenshots of their own while the experiment runs.
 */
export default function useNewLandingPage(): boolean {
  const variant = useLandingMenuVariant();

  if (isE2E()) return !!globalThis.isE2ENewLandingPage;
  // Local development follows the new page, matching how `useFeatureFlag` treats every other flag
  if (isDev()) return true;

  return variant === 'landing' || variant === 'both';
}
