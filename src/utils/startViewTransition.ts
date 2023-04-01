export default function startViewTransition(callback: () => void) {
    // @ts-expect-error
    if (!document.startViewTransition) {
        callback();
    } else {
        // @ts-expect-error
        document.startViewTransition(async () => {
            await callback();

            await new Promise((resolve) => setTimeout(resolve, 20));
        });
    }
}
