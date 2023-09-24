import { throttle } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';

const getViewportSize = () => ({
  width: window.document.body.clientWidth,
  height: window.visualViewport!.height,
});

export default function useViewportSize() {
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState(getViewportSize());

  const handleResize = useCallback(
    throttle(() => {
      setWindowSize(getViewportSize());
    }, 1000),
    [],
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, handleResize };
}
