import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { ScrollableRow } from '~/modules/elements/akui/selector';
import useDebounce from '~/modules/hooks/use-debounce';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';
import { getSongIdWithNew } from '~/routes/sing-a-song/song-selection/utils/get-song-id-with-new';

const SCROLL_DEBOUNCE_MS = 200;

interface Props {
  groupedSongList: SongGroup[];
  onScrollToGroup: (group: SongGroup) => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  keyboardNavRegister?: RegisterFunc;
  focusedSong?: string;
}

interface GroupNavItemProps {
  group: SongGroup;
  isFirstActive: boolean;
  active: boolean;
  containsFocusedSong: boolean;
  onScrollToGroup: (group: SongGroup) => void;
  'data-test': string;
  keyboardNavRegister?: RegisterFunc;
}

// GroupNavItem replicates the scroll-to-center behavior of Selector.Item manually because
// SongGroupsNavigation highlights *multiple* active groups at once (activeGroups: number[]),
// so it can't use the Selector component which is designed for a single selected value.
function GroupNavItem({
  group,
  isFirstActive,
  active,
  containsFocusedSong,
  onScrollToGroup,
  'data-test': dataTest,
  keyboardNavRegister,
}: GroupNavItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const keyboardNavProps = keyboardNavRegister?.(group.name, () => onScrollToGroup(group));

  useEffect(() => {
    if (isFirstActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [isFirstActive]);

  const keyboardFocused = keyboardNavProps?.focused ?? false;
  // The group holding the focused song gets a dimmer highlight, but only as a fallback: once the
  // list is scrolled onto that group (active) or the nav row itself is being keyboard-navigated,
  // the regular full highlight wins.
  const subtleFocused = containsFocusedSong && !active && !keyboardFocused;

  return (
    <Button
      ref={ref}
      size="mini"
      onClick={() => onScrollToGroup(group)}
      {...keyboardNavProps}
      // focused must come after the spread so the active-group highlight isn't
      // overwritten by keyboardNavProps.focused (which is false when not keyboard-navigating)
      focused={active || keyboardFocused || subtleFocused}
      subtleFocused={subtleFocused}
      // Override register-provided values that should not change
      data-active={active}
      data-test={dataTest}
      className="text-md min-w-10 shrink-0 animate-none whitespace-nowrap">
      {group.displayShort ?? group.name}
    </Button>
  );
}

export default function SongGroupsNavigation({
  groupedSongList,
  onScrollToGroup,
  containerRef,
  keyboardNavRegister,
  focusedSong,
}: Props) {
  const [activeGroups, setActiveGroups] = useState<number[]>([]);
  const debouncedActiveGroups = useDebounce(activeGroups, SCROLL_DEBOUNCE_MS);

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

  const firstActiveGroup = debouncedActiveGroups.length > 0 ? Math.min(...debouncedActiveGroups) : -1;

  const focusedSongGroup = useMemo(
    () =>
      focusedSong
        ? groupedSongList.findIndex((group) =>
            group.songs.some((song) => getSongIdWithNew(song, group) === focusedSong),
          )
        : -1,
    [groupedSongList, focusedSong],
  );

  return (
    <ScrollableRow className="items-center">
      {groupedSongList.map((group, index) => {
        const active = debouncedActiveGroups.includes(index);
        return (
          <GroupNavItem
            key={group.name}
            group={group}
            active={active}
            containsFocusedSong={index === focusedSongGroup}
            isFirstActive={index === firstActiveGroup}
            onScrollToGroup={onScrollToGroup}
            keyboardNavRegister={keyboardNavRegister}
            data-test={`group-navigation-${group.name}`}
          />
        );
      })}
    </ScrollableRow>
  );
}
