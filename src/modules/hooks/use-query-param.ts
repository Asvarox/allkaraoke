import { useMemo } from 'react';
import { useSearch } from 'wouter/use-location';

export default function useQueryParam(param: string) {
  const search = useSearch();

  return useMemo(() => new URLSearchParams(search).get(param), [param, search]);
}
