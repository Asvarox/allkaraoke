import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { useEffect, useState } from 'react';

interface Props {
  groupedSongList: SongGroup[];
  onScrollToGroup: (group: SongGroup) => void;
  container: any;
}

export default function SongGroupsNavigation({ groupedSongList, onScrollToGroup, container }: Props) {
  const [activeGroups, setActiveGroups] = useState<string[]>([]);

  useEffect(() => {
    // This is slightly complicated logic needed due to virtualization of the list
    // Intersection observer is used to detect which group header is currently visible.
    // Mutation observer catches changes in the list, e.g. if the group header appears or disappears
    // When it happens it restarts the intersection observer with currently attached groups
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-group-letter')!;

        if (entry.isIntersecting) {
          setActiveGroups((current) => [...current, id]);
        } else {
          setActiveGroups((current) => current.filter((group) => group !== id));
        }
      });
    });

    const mutationObserver = new MutationObserver(() => {
      const element = document.querySelectorAll(`[data-group-letter]`);
      observer.disconnect();
      setActiveGroups([]);

      element.forEach((el) => {
        observer.observe(el);
      });
    });

    if (container) {
      mutationObserver.observe(container, {
        childList: true,
        subtree: true,
      });

      return () => {
        mutationObserver.disconnect();
        setActiveGroups([]);
        observer.disconnect();
      };
    }
  }, [groupedSongList, container]);

  return (
    <>
      <Container>
        {groupedSongList.map((group) => {
          const active = activeGroups.includes(group.letter);
          return (
            <SongsGroupButton
              key={group.letter}
              active={active}
              onClick={() => onScrollToGroup(group)}
              data-active={active}
              data-test={`group-navigation-${group.letter}`}>
              {group.letter}
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
  padding: 1rem 0 1.5rem 2rem;
  width: 100%;
  z-index: 100;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.75);
`;

const SongsGroupButton = styled(Button)<{ active: boolean }>`
  border: none;
  cursor: pointer;
  ${typography};
  display: inline-block;
  padding: 0.5rem 1.25rem;
  font-size: 2.3rem;
  z-index: 1;
  color: ${styles.colors.text.default};
  background: ${(props) => (props.active ? styles.colors.lines.star.stroke : 'rgba(0, 0, 0, 0.7)')};
`;
