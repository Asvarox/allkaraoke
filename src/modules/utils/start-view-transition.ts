let previousTransition: ViewTransition | null = null;

export default function startViewTransition(callback: (isTransitioning: boolean) => void) {
  if (!document.startViewTransition) {
    callback(false);
  } else {
    try {
      // No-op if the previous transition already finished
      previousTransition?.skipTransition();
      const transition = document.startViewTransition(async () => {
        await callback(true);
      });
      // `ready` rejects with AbortError when a newer transition supersedes this one - expected, not an error
      transition.ready.catch(() => undefined);
      previousTransition = transition;

      return transition;
    } catch (e) {
      console.error(e);
    }
  }
}
