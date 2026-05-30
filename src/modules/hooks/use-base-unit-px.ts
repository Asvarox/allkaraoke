import { useMemo } from 'react';
import useViewportSize from '~/modules/hooks/use-viewport-size';

export default function useBaseUnitPx() {
  const { width, height } = useViewportSize();

  // return useMemo(() => width * 0.0035, [width, height]);
  return useMemo(() => parseFloat(getComputedStyle(document.documentElement).fontSize), [width, height]);
}
