import { useMemo } from 'react';

export default function useQueryParam(param: string) {
  return useMemo(() => new URLSearchParams(globalThis.location?.search).get(param), [param]);
}
