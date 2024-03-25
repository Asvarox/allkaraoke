import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useBackground } from 'Elements/LayoutWithBackground';
import { focused, typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import LayoutGame from 'Scenes/LayoutGame';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import AdditionalListControls from 'Scenes/SingASong/SongSelection/Components/AdditionalListControls';
import BackgroundThumbnail from 'Scenes/SingASong/SongSelection/Components/BackgroundThumbnail';
import Playlists from 'Scenes/SingASong/SongSelection/Components/Playlists';
import { FinalSongCard } from 'Scenes/SingASong/SongSelection/Components/SongCard';
import SongGroupsNavigation from 'Scenes/SingASong/SongSelection/Components/SongGroupsNavigation';
import SongPreview from 'Scenes/SingASong/SongSelection/Components/SongPreview';
import useSongSelection from 'Scenes/SingASong/SongSelection/Hooks/useSongSelection';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useBlockScroll from 'hooks/useBlockScroll';
import usePrevious from 'hooks/usePrevious';
import useViewportSize from 'hooks/useViewportSize';
import { SingSetup, SongPreview as SongPreviewEntity } from 'interfaces';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  onSongSelected: (songSetup: SingSetup & { song: SongPreviewEntity }) => void;
  preselectedSong: string | null;
}

const focusMultiplier = 1.2;
const MAX_SONGS_PER_ROW = 4;

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const songsPerRow = mobilePhoneMode ? MAX_SONGS_PER_ROW - 1 : MAX_SONGS_PER_ROW;

  useBackgroundMusic(false);
  useBackground(true);
  useBlockScroll();

  const [{ previewTop, previewLeft, previewWidth, previewHeight }, setPositions] = useState({
    previewTop: 0,
    previewLeft: 0,
    previewWidth: 0,
    previewHeight: 0,
  });
  const {
    focusedGroup,
    focusedSong,
    moveToSong,
    groupedSongList,
    keyboardControl,
    songPreview,
    setKeyboardControl,
    setFilters,
    filters,
    setShowFilters,
    showFilters,
    isLoading,
    randomSong,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  } = useSongSelection(preselectedSong, songsPerRow);
  const songPreviewInGroup = useMemo(
    () =>
      groupedSongList
        .map((group) => group.songs)
        .flat()
        .find((song) => song.song.id === songPreview.id),
    [songPreview, groupedSongList],
  );

  const list = useRef<HTMLDivElement | null>(null);
  const { width, handleResize } = useViewportSize();
  const previouslyFocusedGroup = usePrevious(focusedGroup);
  const previouslyFocusedSong = usePrevious(focusedSong);

  useEffect(() => {
    const selector = (group: string, index: number) => `[data-group-letter="${group}"] [data-index="${index}"]`;
    handleResize(); // Recalculate width/height to account possible scrollbar appearing

    const previousSong = list.current?.querySelector(
      selector(previouslyFocusedGroup, previouslyFocusedSong),
    ) as HTMLDivElement;
    const song = list.current?.querySelector(selector(focusedGroup, focusedSong)) as HTMLDivElement;
    if (song) {
      if (!previousSong || previousSong.offsetTop !== song.offsetTop) {
        song.scrollIntoView?.({
          behavior: 'smooth',
          inline: 'center',
          block: 'center',
        });
      }
      setPositions({
        previewLeft: song.offsetLeft,
        previewTop: song.offsetTop,
        previewWidth: song.offsetWidth,
        previewHeight: song.offsetHeight,
      });
    }
  }, [width, list, focusedSong, focusedGroup, groupedSongList]);

  const expandSong = useCallback(() => setKeyboardControl(false), [setKeyboardControl]);

  const loading = isLoading || !groupedSongList || !width;

  return (
    <LayoutGame>
      <Container songsPerRow={songsPerRow}>
        {loading ? (
          <SongListContainer>
            <SongsGroupContainer>
              <SongsGroupHeader>&nbsp;&nbsp;</SongsGroupHeader>
              <SongsGroup>
                {new Array(16).fill(0).map((_, i) => (
                  <SongListEntrySkeleton key={i} />
                ))}
              </SongsGroup>
            </SongsGroupContainer>
          </SongListContainer>
        ) : (
          <>
            {songPreview && <SongImageBackground videoId={songPreview.video} />}
            <AdditionalListControls
              setFilters={setFilters}
              filters={filters}
              onRandom={randomSong}
              keyboardControl={keyboardControl}
            />
            <SongListContainer ref={list} active={keyboardControl} data-test="song-list-container" dim={showFilters}>
              <SongGroupsNavigation groupedSongList={groupedSongList} containerRef={list} selectSong={moveToSong} />
              {groupedSongList.length === 0 && <NoSongsFound>No songs found</NoSongsFound>}
              {songPreview && (
                <SongPreview
                  isPopular={!!songPreviewInGroup?.isPopular}
                  songPreview={songPreview}
                  onPlay={onSongSelected}
                  keyboardControl={!keyboardControl}
                  onExitKeyboardControl={() => setKeyboardControl(true)}
                  top={previewTop}
                  left={previewLeft}
                  width={previewWidth}
                  height={previewHeight}
                />
              )}
              {groupedSongList.map((group) => (
                <SongsGroupContainer
                  {...(showFilters || !keyboardControl ? { 'data-unfocusable': true } : {})}
                  key={group.letter}
                  data-group-letter={group.letter}
                  highlight={group.letter === 'New'}>
                  <SongsGroupHeader>{group.letter}</SongsGroupHeader>
                  <SongsGroup>
                    {group.songs.map(({ song, index, favorite, isPopular }) => (
                      <SongListEntry
                        isPopular={isPopular}
                        favorite={favorite}
                        key={song.id}
                        song={song}
                        handleClick={focusedSong === index ? expandSong : moveToSong}
                        focused={!showFilters && keyboardControl && index === focusedSong}
                        index={index}
                        data-index={index}
                        data-focused={!showFilters && keyboardControl && index === focusedSong}
                        data-test={`song-${song.id}${group.isNew ? '-new-group' : ''}`}
                      />
                    ))}
                  </SongsGroup>
                </SongsGroupContainer>
              ))}
              <AddSongs>
                Missing a song? Try <a href="convert">adding one</a> yourself!
              </AddSongs>
            </SongListContainer>
          </>
        )}
        <Playlists
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          playlists={playlists}
          active={showFilters}
          closePlaylist={setShowFilters}
        />
      </Container>
    </LayoutGame>
  );
}

const AddSongs = styled.span`
  ${typography};
  text-align: center;
  font-size: 5rem;
  margin-top: 10rem;
`;

const Container = styled.div<{ songsPerRow: number }>`
  display: flex;
  flex-direction: row;
  max-height: 100vh;
  --song-list-gap: 3.5rem;
  --song-item-width: ${(props) =>
    `calc(${100 / props.songsPerRow}% - ((${props.songsPerRow - 1} / ${props.songsPerRow}) * var(--song-list-gap)))`};
  --song-item-ratio: calc(16 / 9 * (4 / ${(props) => props.songsPerRow}));
`;

const SongImageBackground = styled(BackgroundThumbnail)`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(7px) grayscale(90%);
  opacity: 0.25;
  object-fit: cover;
`;

const SongsGroupContainer = styled.div<{ highlight?: boolean }>`
  padding: 0 4.5rem 0 11rem;
  ${(props) =>
    props.highlight &&
    css`
      background: rgba(0, 0, 0, 0.5);
      padding-bottom: 3rem;
      border-bottom: 0.2rem solid black;

      ${SongsGroupHeader} {
        @keyframes new-song-group-header {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        animation: new-song-group-header 600ms ease-in-out infinite both;
        background: #ffffff;
      }
    `}
`;

const NoSongsFound = styled.div`
  ${typography};
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  font-size: 10rem;
`;

const SongsGroupHeader = styled.div`
  ${typography};
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  font-size: 3.5rem;
  z-index: 1;
  color: ${styles.colors.text.active};
  background: rgba(0, 0, 0, 0.7);
`;

const SongListContainer = styled.div<{ active?: boolean; dim?: boolean }>`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: var(--song-list-gap);
  padding: 10rem 0;
  overflow-y: auto;
  overflow-x: clip;
  box-sizing: border-box;
  min-height: 100vh;
  max-height: 100vh;
  ::-webkit-scrollbar {
    display: none;
  }
  transition: opacity 500ms;
  opacity: ${(props) => (props.dim ? 0.5 : 1)};
`;

const SongsGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--song-list-gap);
`;

const SongListEntrySkeleton = styled.div`
  background: black;
  flex-basis: var(--song-item-width);
  aspect-ratio: var(--song-item-ratio);
  border-radius: 1rem;
  animation: skeleton 1s ease-in-out infinite alternate;

  @keyframes skeleton {
    0% {
      opacity: 0.65;
    }
    100% {
      opacity: 0.75;
    }
  }
`;

const SongListEntry = memo(styled(FinalSongCard)`
  cursor: pointer;
  flex-basis: var(--song-item-width);
  aspect-ratio: var(--song-item-ratio);

  ${(props) =>
    props.theme.graphicSetting === 'high' &&
    css`
      transition: 300ms;
    `}
  transform: scale(${(props) => (props.focused ? focusMultiplier : 1)});
  ${(props) => props.focused && 'z-index: 2;'}
  ${(props) => props.focused && focused}

    content-visibility: auto;
  contain-intrinsic-size: calc(var(--song-item-width) * (1 / var(--song-item-ratio)));
`);
