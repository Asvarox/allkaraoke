export default function startViewTransition(callback: () => void) {
    // @ts-expect-error
    if (!document.startViewTransition) {
        callback();
    } else {
        // @ts-expect-error
        document.startViewTransition(callback);
    }
}
