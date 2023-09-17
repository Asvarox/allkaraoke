import { useEffect } from 'react';

export default function useFullscreen() {
  useEffect(() => {
    try {
      process.env.NODE_ENV !== 'development' && document.body.requestFullscreen().catch(console.info);
    } catch (e) {}
  }, []);
}
