let previousTransition: ViewTransition | null = null;

export default function startViewTransition(callback: (isTransitioning: boolean) => void) {
  if (!document.startViewTransition) {
    callback(false);
  } else {
    try {
      if (previousTransition && !previousTransition.finished) {
        previousTransition.skipTransition();
      }
      previousTransition = document.startViewTransition(async () => {
        await callback(true);
      });

      return previousTransition;
    } catch (e) {
      console.error(e);
    }
  }
}
