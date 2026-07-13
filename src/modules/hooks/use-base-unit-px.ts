import { useMemo } from 'react';
import useViewportSize from '~/modules/hooks/use-viewport-size';

export default function useBaseUnitPx() {
  const { width, height } = useViewportSize();

  // return useMemo(() => width * 0.0035, [width, height]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- width/height aren't read directly; they trigger a re-read of the root font size when the viewport changes
  return useMemo(() => parseFloat(getComputedStyle(document.documentElement).fontSize), [width, height]);
}
