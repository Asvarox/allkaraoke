import { useMemo } from 'react';

export default function useQueryParam(param: string) {
  return useMemo(() => new URLSearchParams(global.location?.search).get(param), [param]);
}
