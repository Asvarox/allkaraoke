import { useFeatureFlagVariantKey } from 'posthog-js/react';

import { FeatureFlags } from '~/modules/utils/feature-flags';

/**
 * The four arms of the `new_landing_menu` experiment:
 *
 * - `control` — the classic landing page and the classic button-column menu
 * - `menu` — the tiled main menu only
 * - `landing` — the card-grid landing page only
 * - `both` — both redesigns
 *
 * One flag rather than two, because the landing page and the main menu are the first two screens
 * anyone sees, one straight after the other: with independent flags the four cells only exist as a
 * cross-tab of two rollouts that PostHog never balanced against each other, and "did the redesign
 * help" turns into a question about their overlap. Four variants of one flag makes each combination
 * an arm the experiment actually assigns to.
 */
type LandingMenuVariant = 'control' | 'menu' | 'landing' | 'both';

const VARIANTS: LandingMenuVariant[] = ['control', 'menu', 'landing', 'both'];

/**
 * Which arm this user is in. `control` is what an unevaluated, failed or unrecognised lookup gives:
 * whoever we can't place in the experiment keeps the screens they already know.
 *
 * Read it through {@link useNewMainMenu} / {@link useNewLandingPage} rather than directly — each
 * screen has its own dev and e2e overrides on top of the variant.
 */
export default function useLandingMenuVariant(): LandingMenuVariant {
  const variant = useFeatureFlagVariantKey(FeatureFlags.LandingMenu);

  return VARIANTS.find((known) => known === variant) ?? 'control';
}
