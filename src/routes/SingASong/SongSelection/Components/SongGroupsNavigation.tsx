import styled from '@emotion/styled';
import { Button } from 'modules/Elements/Button';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { useEffect, useState } from 'react';
import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';

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
        const id = entry.target.getAttribute('data-group-name')!;

        if (entry.isIntersecting) {
          setActiveGroups((current) => [...current, id]);
        } else {
          setActiveGroups((current) => current.filter((group) => group !== id));
        }
      });
    });

    const mutationObserver = new MutationObserver(() => {
      const element = document.querySelectorAll(`[data-group-name]`);
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
          const active = activeGroups.includes(group.name);
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
  padding: 1rem 0 1.5rem 2rem;
  width: 100%;
  z-index: 100;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.75);
`;

const SongsGroupButton = styled(Button)`
  border: none;
  cursor: pointer;
  ${typography};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 3.3rem;
  padding: 0.5rem 1.25rem;
  font-size: 2.3rem;
  z-index: 1;
  color: ${styles.colors.text.default};

  &[data-active='true'] {
    background: ${styles.colors.text.active};
  }
  &[data-active='false'] {
    background: rgba(0, 0, 0, 0.7);
  }
`;
