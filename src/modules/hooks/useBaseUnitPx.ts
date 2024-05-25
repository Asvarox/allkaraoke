import useViewportSize from 'modules/hooks/useViewportSize';
import { useMemo } from 'react';

export default function useBaseUnitPx() {
  const { width, height } = useViewportSize();

  return useMemo(() => parseFloat(getComputedStyle(document.documentElement).fontSize), [width, height]);
}
