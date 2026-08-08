import { MutableRefObject, useEffect, useState } from 'react';

import useDebounce from '~/modules/hooks/use-debounce';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';

const SCROLL_DEBOUNCE_MS = 200;

/**
 * Indexes of the groups whose headers are currently scrolled into view in the song list.
 *
 * Lives here rather than inside SongGroupsNavigation because two consumers need the same answer —
 * the on-screen nav row and the copy mirrored to remote mics — and running two IntersectionObservers
 * over the same virtualized list would let them disagree while scrolling.
 */
export default function useVisibleSongGroups(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  groupedSongList: SongGroup[],
) {
  const [activeGroups, setActiveGroups] = useState<number[]>([]);

  useEffect(() => {
    // This is slightly complicated logic needed due to virtualization of the list
    // Intersection observer is used to detect which group header is currently visible.
    // Mutation observer catches changes in the list, e.g. if the group header appears or disappears
    // When it happens it restarts the intersection observer with currently attached groups
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute('data-virtualized-group')!);

        if (entry.isIntersecting) {
          setActiveGroups((current) => [...current, index]);
        } else {
          setActiveGroups((current) => current.filter((group) => group !== index));
        }
      });
    });

    const mutationObserver = new MutationObserver(() => {
      const element = document.querySelectorAll(`[data-virtualized-group]`);
      observer.disconnect();
      setActiveGroups([]);

      element.forEach((el) => {
        observer.observe(el);
      });
    });

    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });

      return () => {
        mutationObserver.disconnect();
        setActiveGroups([]);
        observer.disconnect();
      };
    }
  }, [groupedSongList, containerRef]);

  return useDebounce(activeGroups, SCROLL_DEBOUNCE_MS);
}
