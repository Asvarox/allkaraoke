import { useLocation } from 'wouter';
import startViewTransition from 'utils/startViewTransition';

interface Options {
    replace?: boolean;
    smooth?: boolean;
}

export default function useSmoothNavigate() {
    const [, baseNavigate] = useLocation();

    return (to: string, { smooth = true, ...options }: Options = {}) => {
        // This disabled smooth navigation with viewTransition as it crashes the app on Chrome
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=1443134
        // @ts-ignore
        if (!window.__enableSmooth || !smooth) {
            baseNavigate(to, options);
        } else {
            startViewTransition(() => baseNavigate(to, options));
        }
    };
}
