import { useEffect } from 'react';

export default function useBlockScroll() {
    useEffect(() => {
        document.body.classList.add('blockOverflow');
        document.documentElement.classList.add('blockOverflow');

        return () => {
            document.body.classList.remove('blockOverflow');
            document.documentElement.classList.remove('blockOverflow');
        };
    }, []);
}
