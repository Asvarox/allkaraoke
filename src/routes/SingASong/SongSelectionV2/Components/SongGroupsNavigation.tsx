import { MutableRefObject, useEffect, useState } from 'react';
import { Button } from '~/modules/Elements/AKUI/Button';
import { SongGroup } from '~/routes/SingASong/SongSelectionV2/Hooks/useSongList';

interface Props {
  groupedSongList: SongGroup[];
  onScrollToGroup: (group: SongGroup) => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

export default function SongGroupsNavigation({ groupedSongList, onScrollToGroup, containerRef }: Props) {
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

  return (
    <div className="fixed top-16 right-0 left-0 z-99 flex h-10 flex-row flex-nowrap items-center gap-3 overflow-x-auto bg-black/75 px-4">
      {groupedSongList.map((group, index) => {
        const active = activeGroups.includes(index);
        return (
          <Button
            key={group.name}
            onClick={() => onScrollToGroup(group)}
            data-active={active}
            data-test={`group-navigation-${group.name}`}
            className={`inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border-none px-3 text-2xl ${
              active ? 'bg-[rgb(255,165,0)] text-black' : 'bg-black/70 text-white'
            }`}>
            {group.displayShort ?? group.name}
          </Button>
        );
      })}
    </div>
  );
}
