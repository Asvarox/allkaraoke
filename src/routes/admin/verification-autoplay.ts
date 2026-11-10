import { useEffect, useState } from 'react';

// Kept in memory only, so closing or reloading the tab resets the flow back to manual play.
let isAutoplayPending = false;
let wasBlurredSinceOpen = false;

const resetAutoplay = () => {
  wasBlurredSinceOpen = true;
  isAutoplayPending = false;
};

// Clicking into the YouTube iframe blurs the window too, which shouldn't count as leaving the tab.
const onWindowBlur = () => {
  if (document.activeElement instanceof HTMLIFrameElement) return;

  resetAutoplay();
};

const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') resetAutoplay();
};

/** Called when a queued song is saved - the next song plays on its own unless the tab was left meanwhile. */
export const armVerificationAutoplay = () => {
  isAutoplayPending = !wasBlurredSinceOpen;
};

/**
 * Workflow: the first song of a session is started manually. Saving it (`armVerificationAutoplay`) makes the next
 * opened song autoplay, and so on - until the tab gets hidden/blurred, which makes the next opened song manual again.
 */
export const useVerificationAutoplay = (enabled: boolean) => {
  const [shouldAutoplay] = useState(() => enabled && isAutoplayPending);

  useEffect(() => {
    if (!enabled) return;

    isAutoplayPending = false;
    wasBlurredSinceOpen = document.visibilityState === 'hidden';
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled]);

  return shouldAutoplay;
};
