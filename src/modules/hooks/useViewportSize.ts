import { throttle } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';

const getViewportSize = () => ({
  width: globalThis.document.body.clientWidth,
  height: globalThis.visualViewport!.height,
});

export default function useViewportSize() {
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState(getViewportSize());

  const handleResize = useMemo(
    () =>
      throttle(() => {
        setWindowSize(getViewportSize());
      }, 1000),
    [],
  );

  useEffect(() => {
    globalThis.addEventListener('resize', handleResize);
    handleResize();

    return () => globalThis.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, handleResize };
}
