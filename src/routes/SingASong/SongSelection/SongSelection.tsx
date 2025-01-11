import styled from '@emotion/styled';
import { SingSetup, SongPreview as SongPreviewEntity } from 'interfaces';
import { BackgroundContext, useBackground } from 'modules/Elements/LayoutWithBackground';
import { focused, typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect } from 'modules/GameEvents/hooks';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useBaseUnitPx from 'modules/hooks/useBaseUnitPx';
import useBlockScroll from 'modules/hooks/useBlockScroll';
import useSmoothNavigate, { buildUrl } from 'modules/hooks/useSmoothNavigate';
import useViewportSize from 'modules/hooks/useViewportSize';
import { ComponentProps, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import LayoutGame from 'routes/LayoutGame';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';
import AdditionalListControls from 'routes/SingASong/SongSelection/Components/AdditionalListControls';
import BackgroundThumbnail from 'routes/SingASong/SongSelection/Components/BackgroundThumbnail';
import { Components } from 'routes/SingASong/SongSelection/Components/CustomVirtualization';
import Playlists from 'routes/SingASong/SongSelection/Components/Playlists';
import { FinalSongCard } from 'routes/SingASong/SongSelection/Components/SongCard';
import SongGroupsNavigation from 'routes/SingASong/SongSelection/Components/SongGroupsNavigation';
import SongPreview from 'routes/SingASong/SongSelection/Components/SongPreview';
import { VirtualizedList, VirtualizedListMethods } from 'routes/SingASong/SongSelection/Components/VirtualizedList';
import useSongSelection from 'routes/SingASong/SongSelection/Hooks/useSongSelection';
import { getSongIdWithNew } from 'routes/SingASong/SongSelection/utils/getSongIdWithNew';
import { Link } from 'wouter';

interface Props {
  onSongSelected: (songSetup: SingSetup & { song: SongPreviewEntity }) => void;
  preselectedSong: string | null;
}

declare global {
  var __songList:
    | {
        scrollToSong: (songId: string) => boolean;
      }
    | undefined;
}

const focusMultiplier = 1.1;
const MAX_SONGS_PER_ROW = 4;

const LIST_SIDEBAR_WEIGHT_REM = 7;
const LIST_PADDING_RIGHT_REM = 4.5;
const LIST_PADDING_LEFT_REM = LIST_SIDEBAR_WEIGHT_REM + LIST_PADDING_RIGHT_REM;
const LIST_GAP_REM = 3.5;

const components: Components<{
  songPreviewProps: Omit<ComponentProps<typeof SongPreview>, 'songPreview'> & { songPreview?: SongPreviewEntity };
}> = {
  Header: ({ context }) => (
    <>
      <SongListHeaderPadding />
      {context && context.songPreviewProps.songPreview && (
        <SongPreview {...context.songPreviewProps} songPreview={context.songPreviewProps.songPreview} />
      )}
    </>
  ),
  Footer: () => (
    <AddSongs>
      Missing a song? Try{' '}
      <Link to="convert/">
        <a>adding one</a>
      </Link>{' '}
      yourself!
    </AddSongs>
  ),
  EmptyPlaceholder: () => <NoSongsFound>No songs found</NoSongsFound>,
};

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
  const [additionalSong, setAdditionalSong] = useState<string | null>(preselectedSong);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const songsPerRow = mobilePhoneMode ? MAX_SONGS_PER_ROW - 1 : MAX_SONGS_PER_ROW;

  useBackgroundMusic(false);
  useBackground(true);
  useBlockScroll();
  const {
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
  } = useSongSelection(additionalSong, songsPerRow);
  const songPreviewInGroup = useMemo(
    () =>
      groupedSongList
        .map((group) => group.songs)
        .flat()
        .find((song) => song.song.id === songPreview?.id),
    [songPreview, groupedSongList],
  );

  const selectedPlaylistData = useMemo(
    () => playlists.find((playlist) => playlist.name === selectedPlaylist),
    [playlists, selectedPlaylist],
  );

  const list = useRef<VirtualizedListMethods | null>(null);
  const baseUnit = useBaseUnitPx();
  const { width, handleResize } = useViewportSize();

  const listWidth = width - (LIST_PADDING_LEFT_REM + LIST_PADDING_RIGHT_REM) * baseUnit;
  const songEntryWidth = (listWidth - (songsPerRow - 1) * LIST_GAP_REM * baseUnit) / songsPerRow;
  const songEntryHeight = songEntryWidth * (9 / 16);
  const songGroupHeight = songEntryHeight / 2;

  const expandSong = useCallback(() => setKeyboardControl(false), [setKeyboardControl]);

  const loading = isLoading || !groupedSongList || !width;
  const forceFlag = selectedPlaylist === 'Eurovision';

  const container = useRef<HTMLDivElement>(null);

  // API for Playwright as with virtualization it's super tricky to test
  useEffect(() => {
    global.__songList = {
      scrollToSong: (songId: string) => {
        // If the song is in a new group, we need to remove the '-new-group' suffix
        const [cleanSongId] = songId.split('-new-group');
        const isNewGroup = songId.endsWith('-new-group');
        const songGroup = groupedSongList.find(
          (group) => !!group.isNew === isNewGroup && group.songs.some((song) => song.song.id === cleanSongId),
        );

        if (songGroup) {
          list.current?.scrollToSongInGroup(songId, 'instant');
          return true;
        }
        return false;
      },
    };

    return () => {
      delete global.__songList;
    };
  }, [groupedSongList]);

  const [{ previewTop, previewLeft }, setPositions] = useState(() => ({
    previewTop: 0,
    previewLeft: 0,
  }));
  useEffect(() => {
    const song = document.querySelector<HTMLDivElement>(`[data-song-id="${focusedSong}"]`);
    if (!isLoading && song) {
      const position = list.current?.getSongPosition(focusedSong);
      setPositions({
        previewTop: position?.y ?? 0,
        previewLeft: song.offsetLeft,
      });
    } else if (!isLoading) {
      console.warn(`!!!!!!!!!!!! Song not found "${focusedSong}" !!!!!!!!!!!!`, focusedSong, 'focusedSong');
    }
  }, [focusedSong, isLoading, width, songList]);

  useEffect(() => {
    handleResize(); // Recalculate width/height to account possible scrollbar appearing
    if (!isLoading) {
      list.current?.scrollToSongInGroup(focusedSong);
    }
  }, [width, focusedSong, groupedSongList, isLoading, handleResize]);

  const navigate = useSmoothNavigate();
  useHotkeys('Shift + E', () => navigate(buildUrl(`edit/song/`, { playlist: null, step: 'metadata' })), [navigate]);

  useEventEffect(
    events.remoteSongSelected,
    async (songId) => {
      const isSongOnTheList = songList.some((song) => song.id === songId);
      if (!isSongOnTheList) {
        return setKeyboardControl(false, () => {
          setAdditionalSong(songId);
        });
      }
      if (focusedSong !== songId) {
        moveToSong(songId);
        if (!keyboardControl) {
          setKeyboardControl(true);
        }
        expandSong();
      } else if (keyboardControl) {
        expandSong();
      }
    },
    [songList, focusedSong, keyboardControl, expandSong, moveToSong],
  );

  if (keyboardControl && additionalSong && additionalSong !== focusedSong && !isLoading) {
    setAdditionalSong(null);
  }

  return (
    <LayoutGame>
      <Container
        songsPerRow={songsPerRow}
        style={{
          '--song-group-header-height': `${Math.floor(songGroupHeight)}px`,
          '--song-entry-width': `${Math.floor(songEntryWidth)}px`,
          '--song-entry-height': `${Math.floor(songEntryHeight)}px`,
          '--song-list-gap': `${Math.floor(LIST_GAP_REM * baseUnit)}px`,
          '--song-list-padding-left': `${Math.floor(LIST_PADDING_LEFT_REM * baseUnit)}px`,
          '--song-list-padding-right': `${Math.floor(LIST_PADDING_RIGHT_REM * baseUnit)}px`,
          '--song-sidebar-weight': `${Math.floor(LIST_SIDEBAR_WEIGHT_REM * baseUnit)}px`,
        }}>
        {loading ? (
          <SongListContainer>
            <GroupRow>
              <SongsGroupContainer>
                <SongsGroupHeader>&nbsp;&nbsp;&nbsp;</SongsGroupHeader>
              </SongsGroupContainer>
            </GroupRow>
            {new Array(4).fill(0).map((_, i) => (
              <ListRow key={i}>
                {new Array(4).fill(0).map((_, i) => (
                  <SongListEntrySkeleton key={i} />
                ))}
              </ListRow>
            ))}
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
              containerRef={container}
              groupedSongList={groupedSongList}
              onScrollToGroup={(group) => {
                moveToSong(getSongIdWithNew(group.songs[0], group));

                // wait for the song to be selected and scrolled into view - then override the scroll and scroll to the group instead
                setTimeout(() => list.current?.scrollToGroup(group.name), 20);
              }}
            />
            <SongListContainer
              active={keyboardControl}
              dim={showFilters}
              data-test="song-list-container"
              ref={container}>
              <VirtualizedList
                focusedSong={focusedSong}
                ListRowWrapper={ListRow}
                GroupRowWrapper={GroupRow}
                ref={list}
                groups={groupedSongList}
                itemHeight={Math.floor(songEntryHeight) + Math.floor(LIST_GAP_REM * baseUnit)}
                groupHeight={Math.floor(songGroupHeight) + Math.floor(LIST_GAP_REM * baseUnit)}
                components={components}
                renderGroup={(group) => (
                  <SongsGroupContainer key={group.name} data-highlight={group.name === 'New'}>
                    <SongsGroupHeader data-group-name={group.name} className="rounded-md">
                      {group.displayLong ?? group.name}
                    </SongsGroupHeader>
                  </SongsGroupContainer>
                )}
                perRow={songsPerRow}
                renderItem={(songItem, group) => {
                  const songId = getSongIdWithNew(songItem, group);
                  const isFocused = songId === focusedSong;
                  return (
                    <SongListEntry
                      {...(showFilters || !keyboardControl ? { 'data-unfocusable': true } : {})}
                      isPopular={songItem.isPopular}
                      key={songItem.song.id}
                      song={songItem.song}
                      handleClick={isFocused ? expandSong : moveToSong}
                      focused={!showFilters && keyboardControl && isFocused}
                      songId={songId}
                      groupLetter={group.name}
                      data-song-index={songItem.index}
                      data-song-id={songId}
                      data-focused={!showFilters && keyboardControl && isFocused}
                      data-test={`song-${getSongIdWithNew(songItem, group)}`}
                      data-group={group.name}
                      forceFlag={forceFlag}
                    />
                  );
                }}
                placeholder={<SongListEntrySkeleton style={{ visibility: 'hidden' }} />}
                context={{
                  songPreviewProps: {
                    forceFlag,
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
                Footer={
                  selectedPlaylistData?.footerComponent ?? (
                    <AddSongs>
                      Missing a song? Try{' '}
                      <Link to="convert/">
                        <a>adding one</a>
                      </Link>{' '}
                      yourself!
                    </AddSongs>
                  )
                }
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

const SongImageBackground = (props: ComponentProps<typeof SongImageBackgroundBase>) => {
  const { theme } = useContext(BackgroundContext);
  if (theme === 'eurovision') {
    return null;
  }

  return <SongImageBackgroundBase {...props} />;
};

const SongImageBackgroundBase = styled(BackgroundThumbnail)`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(7px) grayscale(90%);
  opacity: 0.25;
  object-fit: cover;
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
const SongListContainer = styled.div<{ active?: boolean; dim?: boolean }>`
  position: relative;
  flex: 1 1 auto;
  min-height: 100vh;
  max-height: 100vh;
  transition: opacity 500ms;
  opacity: ${(props) => (props.dim ? 0.5 : 1)};
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

  transition: 300ms; // todo disable for graphic setting

  transform: scale(1);
  &[data-focused='true'] {
    transform: scale(${focusMultiplier});
    z-index: 2;
    ${focused};
  }
`);

const SongListHeaderPadding = styled.div`
  //height: var(--song-list-gap);
`;

const BaseRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: var(--song-list-gap);
  padding: 0 var(--song-list-padding-right) 0 var(--song-list-padding-left);
  margin-bottom: var(--song-list-gap);
`;

const GroupRow = styled(BaseRow)``;

const ListRow = styled(BaseRow)`
  position: relative; // this way the song preview position is computed properly

  &[data-is-new='true'] {
    background-color: rgba(0, 0, 0, 0.7);
    background-position-y: var(--song-list-gap);
    background-repeat: no-repeat;
  }
`;

const SongsGroupHeader = styled.div`
  ${typography};
  display: flex;
  padding: 0.5rem 1rem;
  font-size: 5.4rem;
  z-index: 1;
  color: ${styles.colors.text.active};
  background: rgba(0, 0, 0, 0.7);
  align-items: center;
  gap: 1rem;
`;

const SongsGroupContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: var(--song-group-header-height);

  &[data-highlight='true'] {
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
  }
`;
