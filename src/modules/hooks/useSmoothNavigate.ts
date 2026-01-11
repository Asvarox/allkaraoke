import { useLocation } from 'wouter';
import startViewTransition from '~/modules/utils/startViewTransition';

interface Options {
  replace?: boolean;
  smooth?: boolean;
}

export const buildUrl = (to: string, params?: Record<string, string | null>) => {
  if (!params) {
    return to;
  }
  const url = new URLSearchParams(global.location?.search);

  Object.entries(params).forEach(([param, value]) => {
    if (value === null) {
      url.delete(param);
    } else {
      url.set(param, value);
    }
  });
  return `${to}?${url.toString()}`;
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
