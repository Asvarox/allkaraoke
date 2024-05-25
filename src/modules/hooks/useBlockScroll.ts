import { useEffect } from 'react';

let mounts = 0;

export default function useBlockScroll() {
  useEffect(() => {
    document.body.classList.add('blockOverflow');
    document.documentElement.classList.add('blockOverflow');
    mounts++;

    return () => {
      mounts--;

      if (mounts === 0) {
        document.body.classList.remove('blockOverflow');
        document.documentElement.classList.remove('blockOverflow');
      }
    };
  }, []);
}
