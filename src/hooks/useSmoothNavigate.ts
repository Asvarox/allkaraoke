import startViewTransition from 'utils/startViewTransition';
import { useLocation } from 'wouter';

interface Options {
    replace?: boolean;
    smooth?: boolean;
}

export default function useSmoothNavigate() {
    const [, baseNavigate] = useLocation();

    return (to: string, { smooth = true, ...options }: Options = {}) => {
        if (!smooth) {
            baseNavigate(to, options);
        } else {
            startViewTransition(() => baseNavigate(to, options));
        }
    };
}
