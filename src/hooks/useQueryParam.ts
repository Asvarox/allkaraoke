import { useMemo } from 'react';

export default function useQueryParam(param: string) {
  return useMemo(() => new URLSearchParams(window.location.search).get(param), [param]);
}
