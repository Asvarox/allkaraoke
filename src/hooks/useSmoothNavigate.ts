import setQueryParam from 'utils/setQueryParam';
import startViewTransition from 'utils/startViewTransition';
import { useLocation } from 'wouter';

interface Options {
  replace?: boolean;
  smooth?: boolean;
}

export const buildUrl = (to: string, params?: Record<string, string | null>) =>
  params ? `${to}${setQueryParam(params)}` : to;

export default function useSmoothNavigate() {
  const [, baseNavigate] = useLocation();

  return (to: string, params?: Record<string, string | null>, { smooth = true, ...options }: Options = {}) => {
    if (!smooth) {
      baseNavigate(buildUrl(to, params), options);
    } else {
      startViewTransition(() => baseNavigate(buildUrl(to, params), options));
    }
  };
}
