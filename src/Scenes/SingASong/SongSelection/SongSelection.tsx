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
import { VirtualizedList, VirtualizedListMethods } from 'Scenes/SingASong/SongSelection/Components/VirtualizedList';
import { SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import useSongSelection from 'Scenes/SingASong/SongSelection/Hooks/useSongSelection';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useBaseUnitPx from 'hooks/useBaseUnitPx';
import useBlockScroll from 'hooks/useBlockScroll';
import useViewportSize from 'hooks/useViewportSize';
import { SingSetup, SongPreview as SongPreviewEntity } from 'interfaces';
import { ComponentProps, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Components } from 'react-virtuoso';
import { Link } from 'wouter';

interface Props {
  onSongSelected: (songSetup: SingSetup & { song: SongPreviewEntity }) => void;
  preselectedSong: string | null;
}

declare global {
  interface Window {
    __songList?: {
      scrollToSong: (songId: string) => void;
    };
  }
}

const focusMultiplier = 1.2;
const MAX_SONGS_PER_ROW = 4;

const LIST_SIDEBAR_WEIGHT_REM = 7;
const LIST_PADDING_RIGHT_REM = 4.5;
const LIST_PADDING_LEFT_REM = LIST_SIDEBAR_WEIGHT_REM + LIST_PADDING_RIGHT_REM;
const LIST_GAP_REM = 3.5;

const components: Components<
  any,
  {
    songPreview: ComponentProps<typeof SongPreview>;
  }
> = {
  Header: ({ context }) => (
    <>
      <SongListHeaderPadding />
      {context && context.songPreview.songPreview && <SongPreview {...context.songPreview} />}
    </>
  ),
  Footer: () => (
    <AddSongs>
      Missing a song? Try{' '}
      <Link to="/convert/">
        <a>adding one</a>
      </Link>{' '}
      yourself!
    </AddSongs>
  ),
  EmptyPlaceholder: () => <NoSongsFound>No songs found</NoSongsFound>,
};

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const songsPerRow = mobilePhoneMode ? MAX_SONGS_PER_ROW - 1 : MAX_SONGS_PER_ROW;

  useBackgroundMusic(false);
  useBackground(true);
  useBlockScroll();

  const [{ previewTop, previewLeft }, setPositions] = useState({
    previewTop: 0,
    previewLeft: 0,
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
    songList,
  } = useSongSelection(preselectedSong, songsPerRow);
  const songPreviewInGroup = useMemo(
    () =>
      groupedSongList
        .map((group) => group.songs)
        .flat()
        .find((song) => song.song.id === songPreview.id),
    [songPreview, groupedSongList],
  );

  const list = useRef<VirtualizedListMethods | null>(null);
  const baseUnit = useBaseUnitPx();
  const { width, handleResize } = useViewportSize();

  const listWidth = width - (LIST_PADDING_LEFT_REM + LIST_PADDING_RIGHT_REM) * baseUnit;
  const songEntryWidth = (listWidth - (songsPerRow - 1) * LIST_GAP_REM * baseUnit) / songsPerRow;
  const songEntryHeight = songEntryWidth * (9 / 16);

  useEffect(() => {
    handleResize(); // Recalculate width/height to account possible scrollbar appearing
    list.current?.scrollToSongInGroup(focusedGroup, focusedSong);
  }, [width, list, focusedSong, focusedGroup, groupedSongList]);

  const expandSong = useCallback(() => setKeyboardControl(false), [setKeyboardControl]);

  const loading = isLoading || !groupedSongList || !width;

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const soughtElement = document.querySelector<HTMLDivElement>(`[data-song-index="${focusedSong}"`);

      if (soughtElement && (previewTop !== soughtElement.offsetTop || previewLeft !== soughtElement.offsetLeft)) {
        setPositions({
          previewLeft: soughtElement.offsetLeft,
          previewTop: soughtElement.offsetTop,
        });
      }
    });

    if (container.current) {
      observer.observe(container.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return () => observer.disconnect();
    }
  }, [focusedSong, previewTop, previewLeft]);

  // API for Playwright as with virtualization it's super tricky to test
  useEffect(() => {
    const getSongIndex = (songId: string) => songList.findIndex((song) => song.id === songId);
    window.__songList = {
      scrollToSong: (songId: string) => {
        const songGroup = groupedSongList.find((group) => group.songs.some((song) => song.song.id === songId));
        if (songGroup) {
          const songIndex = getSongIndex(songId);
          list.current?.scrollToSongInGroup(songGroup.letter, songIndex, 'auto');
        }
      },
    };

    return () => {
      delete window.__songList;
    };
  }, [groupedSongList, songList]);

  return (
    <LayoutGame>
      <Container
        songsPerRow={songsPerRow}
        style={{
          '--song-group-header-height': `${Math.floor(songEntryHeight / 1.5)}px`,
          '--song-entry-width': `${Math.floor(songEntryWidth)}px`,
          '--song-entry-height': `${Math.floor(songEntryHeight)}px`,
          '--song-list-gap': `${Math.floor(LIST_GAP_REM * baseUnit)}px`,
          '--song-list-padding-left': `${Math.floor(LIST_PADDING_LEFT_REM * baseUnit)}px`,
          '--song-list-padding-right': `${Math.floor(LIST_PADDING_RIGHT_REM * baseUnit)}px`,
          '--song-sidebar-weight': `${Math.floor(LIST_SIDEBAR_WEIGHT_REM * baseUnit)}px`,
        }}>
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
            <SongGroupsNavigation
              container={container.current}
              groupedSongList={groupedSongList}
              onScrollToGroup={(group) => {
                moveToSong(group.songs[0].index);

                // wait for the song to be selected and scrolled into view - then override the scroll and scroll to the group instead
                setTimeout(() => list.current?.scrollToGroup(group.letter), 20);
              }}
            />
            <SongListContainer
              active={keyboardControl}
              dim={showFilters}
              data-test="song-list-container"
              ref={container}>
              <VirtualizedList
                ListRowWrapper={ListRow}
                GroupRowWrapper={GroupRow}
                ref={list}
                groups={groupedSongList}
                components={components}
                renderGroup={(group) => (
                  <SongsGroupContainer
                    {...(showFilters || !keyboardControl ? { 'data-unfocusable': true } : {})}
                    key={group.letter}
                    highlight={group.letter === 'New'}>
                    <SongsGroupHeader data-group-letter={group.letter}>{group.letter}</SongsGroupHeader>
                  </SongsGroupContainer>
                )}
                perRow={songsPerRow}
                renderItem={(songItem, group) => (
                  <SongListEntry
                    isPopular={songItem.isPopular}
                    key={songItem.song.id}
                    song={songItem.song}
                    handleClick={focusedSong === songItem.index ? expandSong : moveToSong}
                    focused={!showFilters && keyboardControl && songItem.index === focusedSong}
                    index={songItem.index}
                    data-song-index={songItem.index}
                    data-focused={!showFilters && keyboardControl && songItem.index === focusedSong}
                    data-test={`song-${songItem.song.id}${group.isNew ? '-new-group' : ''}`}
                  />
                )}
                placeholder={<SongListEntrySkeleton style={{ visibility: 'hidden' }} />}
                context={{
                  songPreview: {
                    isPopular: !!songPreviewInGroup?.isPopular,
                    keyboardControl: !keyboardControl,
                    onPlay: onSongSelected,
                    onExitKeyboardControl: () => setKeyboardControl(true),
                    songPreview,
                    top: previewTop,
                    left: previewLeft,
                    width: Math.floor(songEntryWidth),
                    height: Math.floor(songEntryHeight),
                  },
                }}
              />
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

const AddSongs = styled.div`
  ${typography};
  text-align: center;
  font-size: 5rem;
  padding: 10rem 0;
`;

const Container = styled.div<{ songsPerRow: number }>`
  display: flex;
  flex-direction: row;
  max-height: 100vh;
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
  display: flex;
  align-items: flex-end;
  height: var(--song-group-header-height);
  ${(props) =>
    props.highlight &&
    css`
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
  height: 75vh;

  font-size: 10rem;
`;

const SongsGroupHeader = styled.div`
  ${typography};
  display: flex;
  padding: 0.5rem 1rem;
  font-size: 3.5rem;
  z-index: 1;
  color: ${styles.colors.text.active};
  background: rgba(0, 0, 0, 0.7);
`;

const SongListContainer = styled.div<{ active?: boolean; dim?: boolean }>`
  position: relative;
  flex: 1 1 auto;
  min-height: 100vh;
  max-height: 100vh;
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
  flex-basis: var(--song-entry-width);
  height: var(--song-entry-height);
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
  flex-basis: var(--song-entry-width);
  height: var(--song-entry-height);

  ${(props) =>
    props.theme.graphicSetting === 'high' &&
    css`
      transition: 300ms;
    `}
  transform: scale(${(props) => (props.focused ? focusMultiplier : 1)});
  ${(props) => props.focused && 'z-index: 2;'}
  ${(props) => props.focused && focused}
`);

const SongListHeaderPadding = styled.div`
  //height: var(--song-list-gap);
`;

const GroupRow = styled.div<{ group: SongGroup }>`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: calc(var(--song-list-gap) / 2) var(--song-list-padding-right) calc(var(--song-list-gap) / 2)
    var(--song-list-padding-left);
`;

const ListRow = styled(GroupRow)<{ group: SongGroup }>`
  ${(props) =>
    props.group.isNew &&
    css`
      background: rgba(0, 0, 0, 0.7);
    `}
`;
