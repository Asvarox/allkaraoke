import { ReactNode } from 'react';

import { useBackground } from '~/modules/elements/background-context';
import LayoutWithBackgroundProvider from '~/modules/elements/layout-with-background';

/** Stands in for the singing screen, which hides the app background behind the video. */
function SingingScreenLeftovers() {
  useBackground(false);
  return null;
}

/**
 * Wraps a post-game story the way the game reaches those screens: inside the provider that paints
 * the app's blue background, arriving with that background already switched off by the singing
 * screen.
 *
 * The provider alone starts visible, which is how these stories once showed a background the real
 * game did not — the results screen never turned it back on. Rendered as an earlier sibling so its
 * effect runs first, the way singing's did, leaving the screen under test to turn it on again.
 */
export function PostGameBackground({ children }: { children: ReactNode }) {
  return (
    <LayoutWithBackgroundProvider>
      <SingingScreenLeftovers />
      {children}
    </LayoutWithBackgroundProvider>
  );
}
