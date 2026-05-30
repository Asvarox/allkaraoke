import { throttle } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';

const getViewportSize = () => ({
  width: global.document.body.clientWidth,
  height: global.visualViewport!.height,
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
    global.addEventListener('resize', handleResize);
    handleResize();

    return () => global.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, handleResize };
}
