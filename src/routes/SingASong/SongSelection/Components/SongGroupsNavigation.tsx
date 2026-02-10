import styled from '@emotion/styled';
import { MutableRefObject, useEffect, useState } from 'react';
import { Button } from '~/modules/Elements/Button';
import { typography } from '~/modules/Elements/cssMixins';
import styles from '~/modules/GameEngine/Drawing/styles';
import { SongGroup } from '~/routes/SingASong/SongSelection/Hooks/useSongList';

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
    <>
      <Container>
        {groupedSongList.map((group, index) => {
          const active = activeGroups.includes(index);
          return (
            <SongsGroupButton
              key={group.name}
              onClick={() => onScrollToGroup(group)}
              data-active={active}
              data-test={`group-navigation-${group.name}`}>
              {group.displayShort ?? group.name}
            </SongsGroupButton>
          );
        })}
      </Container>
    </>
  );
}

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  top: 0;
  left: var(--song-sidebar-weight);
  padding: 0 0 0 2rem;
  height: 4rem;
  width: 100%;
  z-index: 100;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.75);
`;

const SongsGroupButton = styled(Button)`
  border: none;
  cursor: pointer;
  ${typography};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  padding: 0.25rem 0.75rem;
  font-size: 1.5rem;
  z-index: 1;
  color: ${styles.colors.text.default};

  &[data-active='true'] {
    background: ${styles.colors.text.active};
  }
  &[data-active='false'] {
    background: rgba(0, 0, 0, 0.7);
  }
`;
