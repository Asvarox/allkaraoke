export default function startViewTransition(callback: () => void) {
  // @ts-expect-error startViewTransition not in typings
  if (!document.startViewTransition) {
    callback();
  } else {
    // @ts-expect-error startViewTransition not in typing
    document.startViewTransition(async () => {
      await callback();
    });
  }
}
