let previousTransition: ViewTransition | null = null;

export default function startViewTransition(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
  } else {
    try {
      if (previousTransition && !previousTransition.finished) {
        previousTransition.skipTransition();
      }
      previousTransition = document.startViewTransition(async () => {
        await callback();
      });
    } catch (e) {
      console.error(e);
    }
  }
}
