import useViewportSize from 'modules/hooks/useViewportSize';
import { useMemo } from 'react';

export default function useBaseUnitPx() {
  const { width, height } = useViewportSize();

  // return useMemo(() => width * 0.0035, [width, height]);
  return useMemo(() => parseFloat(getComputedStyle(document.documentElement).fontSize), [width, height]);
}
