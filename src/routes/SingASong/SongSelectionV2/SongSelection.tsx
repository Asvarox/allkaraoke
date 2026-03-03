import isMobile from 'is-mobile';
import {
  ComponentProps,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Link } from 'wouter';
import { SingSetup, SongPreview as SongPreviewEntity } from '~/interfaces';
import { BackgroundContext, useBackground } from '~/modules/Elements/BackgroundContext';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect } from '~/modules/GameEvents/hooks';
import { useSetlist } from '~/modules/Songs/hooks/useSetlist';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import useBaseUnitPx from '~/modules/hooks/useBaseUnitPx';
import useBlockScroll from '~/modules/hooks/useBlockScroll';
import useSmoothNavigate, { buildUrl } from '~/modules/hooks/useSmoothNavigate';
import useViewportSize from '~/modules/hooks/useViewportSize';
import LayoutGame from '~/routes/LayoutGame';
import BackgroundThumbnail from '~/routes/SingASong/SongSelectionV2/Components/BackgroundThumbnail';
import { Components } from '~/routes/SingASong/SongSelectionV2/Components/CustomVirtualization';
import { FinalSongCard } from '~/routes/SingASong/SongSelectionV2/Components/SongCard';
import SongGroupsNavigation from '~/routes/SingASong/SongSelectionV2/Components/SongGroupsNavigation';
import SongPreview from '~/routes/SingASong/SongSelectionV2/Components/SongPreview';
import Toolbar from '~/routes/SingASong/SongSelectionV2/Components/Toolbar';
import { VirtualizedList, VirtualizedListMethods } from '~/routes/SingASong/SongSelectionV2/Components/VirtualizedList';
import useSongSelection from '~/routes/SingASong/SongSelectionV2/Hooks/useSongSelection';
import { getSongIdWithNew } from '~/routes/SingASong/SongSelectionV2/utils/getSongIdWithNew';

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

function useMediaQueryNative(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

const ListRow = ({ children, ...props }: ComponentProps<'div'>) => (
  <div
    {...props}
    className={`relative mb-(--song-list-gap) flex flex-nowrap gap-(--song-list-gap) pr-(--song-list-padding-right) pl-(--song-list-padding-left) ${
      props.className ?? ''
    }`}
  />
);

const GroupRow = ({ children, ...props }: ComponentProps<'div'>) => (
  <div
    {...props}
    className={`mb-(--song-list-gap) flex flex-nowrap gap-(--song-list-gap) pr-(--song-list-padding-right) pl-(--song-list-padding-left) ${
      props.className ?? ''
    }`}
  />
);

const SongListEntry = memo(({ focused: isFocused, ...props }: ComponentProps<typeof FinalSongCard>) => (
  <FinalSongCard
    {...props}
    focused={isFocused}
    className={[
      'flex-none cursor-pointer transition-all duration-300',
      isFocused ? 'z-2 scale-[1.15]' : '',
      props.className ?? '',
    ]
      .join(' ')
      .trim()}
    style={{
      flexBasis: 'var(--song-entry-width)',
      width: 'var(--song-entry-width)',
      height: 'var(--song-entry-height)',
      ...props.style,
    }}
  />
));
SongListEntry.displayName = 'SongListEntry';

const SongImageBackground = ({ videoId }: { videoId: string }) => {
  const { theme } = useContext(BackgroundContext);
  if (theme === 'eurovision') {
    return null;
  }

  return (
    <BackgroundThumbnail
      videoId={videoId}
      className="fixed inset-0 h-full w-full object-cover opacity-25"
      style={{ filter: 'blur(7px) grayscale(90%)' }}
    />
  );
};

const components: Components<{
  songPreviewProps: Omit<ComponentProps<typeof SongPreview>, 'songPreview'> & { songPreview?: SongPreviewEntity };
}> = {
  Header: ({ context }) => (
    <>
      <div />
      {context?.songPreviewProps.songPreview && (
        <SongPreview {...context.songPreviewProps} songPreview={context.songPreviewProps.songPreview} />
      )}
    </>
  ),
  EmptyPlaceholder: () => (
    <div className="flex h-[75vh] flex-1 items-center justify-center text-8xl font-(--font-family) text-white">
      No songs found
    </div>
  ),
};

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
  const setlist = useSetlist();
  const [additionalSong, setAdditionalSong] = useState<string | null>(preselectedSong);
  const isMobileDevice = useMemo(() => isMobile(), []);
  const isLandscape = useMediaQueryNative('(orientation: landscape)');

  // Mobile mode always shows 3 songs per row, regardless of feature flag
  const songsPerRow = !isLandscape && isMobileDevice ? 1 : isMobileDevice && isLandscape ? 2 : 3;
  const LIST_GAP_REM = isMobileDevice ? 1 : 2.5;
  const LIST_PADDING_RIGHT_REM = isMobileDevice ? 1 : 2;
  const LIST_PADDING_LEFT_REM = LIST_PADDING_RIGHT_REM;

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
      list.current?.scrollToSongInGroup(focusedSong);
    } else if (!isLoading) {
      console.warn(`!!!!!!!!!!!! Song not found "${focusedSong}" !!!!!!!!!!!!`, focusedSong, 'focusedSong');
    }
  }, [focusedSong, isLoading, width, songList]);

  useLayoutEffect(() => {
    handleResize(); // Recalculate width/height to account possible scrollbar appearing
    if (!isLoading) {
      list.current?.scrollToSongInGroup(focusedSong, 'auto');
    }
  }, [width, selectedPlaylist, filters.search, isLoading, handleResize]);

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
      <div
        className="flex h-screen flex-col overflow-hidden"
        style={
          {
            '--song-group-header-height': `${Math.floor(songGroupHeight)}px`,
            '--song-entry-width': `${Math.floor(songEntryWidth)}px`,
            '--song-entry-height': `${Math.floor(songEntryHeight)}px`,
            '--song-list-gap': `${Math.floor(LIST_GAP_REM * baseUnit)}px`,
            '--song-list-padding-left': `${Math.floor(LIST_PADDING_LEFT_REM * baseUnit)}px`,
            '--song-list-padding-right': `${Math.floor(LIST_PADDING_RIGHT_REM * baseUnit)}px`,
          } as React.CSSProperties
        }>
        <Toolbar
          filters={filters}
          setFilters={setFilters}
          onRandom={randomSong}
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          keyboardControl={keyboardControl}
        />
        {!loading && (
          <SongGroupsNavigation
            containerRef={container}
            groupedSongList={groupedSongList}
            onScrollToGroup={(group) => {
              moveToSong(getSongIdWithNew(group.songs[0], group));
              // wait for the song to be selected and scrolled into view - then override the scroll and scroll to the group instead
              setTimeout(() => list.current?.scrollToGroup(group.name), 20);
            }}
          />
        )}
        <div
          className={`relative flex-1 overflow-auto transition-opacity duration-500 ${showFilters ? 'opacity-50' : ''}`}
          data-test="song-list-container"
          ref={container}>
          {songPreview && <SongImageBackground videoId={songPreview.video} />}
          {loading ? (
            <>
              <GroupRow>
                <div className="flex h-(--song-group-header-height) items-end">
                  <div className="rounded-md bg-black/70 px-3 py-1 text-4xl font-(--font-family) text-white">
                    &nbsp;&nbsp;&nbsp;
                  </div>
                </div>
              </GroupRow>
              {new Array(4).fill(0).map((_, i) => (
                <ListRow key={i}>
                  {new Array(songsPerRow).fill(0).map((_, j) => (
                    <div
                      key={j}
                      className="flex-none animate-pulse rounded-2xl bg-black"
                      style={{
                        flexBasis: 'var(--song-entry-width)',
                        width: 'var(--song-entry-width)',
                        height: 'var(--song-entry-height)',
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </ListRow>
              ))}
            </>
          ) : (
            <VirtualizedList
              focusedSong={focusedSong}
              ListRowWrapper={ListRow}
              GroupRowWrapper={GroupRow}
              ref={list}
              groups={groupedSongList}
              itemHeight={Math.floor(songEntryHeight) + Math.floor(LIST_GAP_REM * baseUnit)}
              groupHeight={Math.floor(songGroupHeight) + Math.floor(LIST_GAP_REM * baseUnit)}
              components={components}
              renderGroup={(group) => {
                const isNew = group.name === 'New';
                return (
                  <div
                    key={group.name}
                    className="flex h-(--song-group-header-height) items-end"
                    data-highlight={isNew}>
                    {isNew && (
                      <style>{`@keyframes new-song-group-header { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
                    )}
                    <div
                      data-group-name={group.name}
                      className="z-1 flex items-center gap-3 rounded-md px-3 py-1 text-4xl font-(--font-family)"
                      style={{
                        background: isNew ? '#ffffff' : 'rgba(0,0,0,0.7)',
                        color: isNew ? '#000' : '#fff',
                        animation: isNew ? 'new-song-group-header 600ms ease-in-out infinite both' : undefined,
                      }}>
                      {group.displayLong ?? group.name}
                    </div>
                  </div>
                );
              }}
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
              placeholder={
                <div
                  className="invisible flex-none rounded-2xl"
                  style={{
                    flexBasis: 'var(--song-entry-width)',
                    width: 'var(--song-entry-width)',
                    height: 'var(--song-entry-height)',
                  }}
                />
              }
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
                selectedPlaylistData?.footerComponent ??
                (setlist.isEditable ? (
                  <div className="py-32 text-center text-5xl font-(--font-family) text-white">
                    Missing a song? Try{' '}
                    <Link to="convert/">
                      <a>adding one</a>
                    </Link>{' '}
                    yourself!
                  </div>
                ) : null)
              }
            />
          )}
        </div>
      </div>
    </LayoutGame>
  );
}
