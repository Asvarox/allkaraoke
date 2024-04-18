import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { useEffect, useState } from 'react';

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
  groupedSongList: SongGroup[];
  selectSong: (songIndex: number) => void;
}

export default function SongGroupsNavigation({ groupedSongList, containerRef, selectSong }: Props) {
  const [activeGroups, setActiveGroups] = useState<string[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-group-letter')!;

          if (entry.isIntersecting) {
            setActiveGroups((current) => [...current, id]);
          } else {
            setActiveGroups((current) => current.filter((group) => group !== id));
          }
        });
      },
      { threshold: 0.05 },
    );
    groupedSongList.forEach((group) => {
      const element = document.querySelector(`[data-group-letter="${group.letter}"]`);
      if (element) {
        observer.observe(element);
      }
    });
    return () => {
      observer.disconnect();
      setActiveGroups([]);
    };
  }, [groupedSongList]);

  const scrollToGroup = (group: SongGroup) => {
    selectSong(group.songs[0].index);

    // wait for the song to be selected and scrolled into view - then override the scroll and scroll to the group instead
    setTimeout(() => {
      const element = document.querySelector(`[data-group-letter="${group.letter}"]`);
      if (element && containerRef.current) {
        // calculate 10rem offset from top
        const offset = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize);

        const topPos = element.getBoundingClientRect().top + containerRef.current.scrollTop - offset;
        containerRef.current.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }, 20);
  };

  return (
    <>
      <Container>
        {groupedSongList.map((group) => {
          const active = activeGroups.includes(group.letter);
          return (
            <SongsGroupButton
              key={group.letter}
              active={active}
              onClick={() => scrollToGroup(group)}
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
  left: 6.2rem;
  padding: 1rem 0 1.5rem 2rem;
  width: 100%;
  z-index: 100;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.8);
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
