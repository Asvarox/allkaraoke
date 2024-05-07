import startViewTransition from 'utils/startViewTransition';
import { useLocation } from 'wouter';

interface Options {
  replace?: boolean;
  smooth?: boolean;
}

export const buildUrl = (to: string, params?: Record<string, string | null>) => {
  if (params) {
    const url = new URLSearchParams(window.location.search);

    Object.entries(params).forEach(([param, value]) => {
      if (value === null) {
        url.delete(param);
      } else {
        url.set(param, value);
      }
    });
    return `${to}?${url.toString()}`;
  }
  return to;
};

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
