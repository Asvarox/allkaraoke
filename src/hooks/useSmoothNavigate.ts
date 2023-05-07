import { useLocation } from 'wouter';
import startViewTransition from 'utils/startViewTransition';

interface Options {
    replace?: boolean;
    smooth?: boolean;
}

export default function useSmoothNavigate() {
    const [, baseNavigate] = useLocation();

    return (to: string, { smooth = true, ...options }: Options = {}) => {
        if (true || !smooth) {
            baseNavigate(to, options);
        } else {
            startViewTransition(() => baseNavigate(to, options));
        }
    };
}
