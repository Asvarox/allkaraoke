import { ComponentProps, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Link } from 'wouter';
import { SingSetup, SongPreview as SongPreviewEntity } from '~/interfaces';
import { useBackground } from '~/modules/elements/background-context';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useBlockScroll from '~/modules/hooks/use-block-scroll';
import useSmoothNavigate, { buildUrl } from '~/modules/hooks/use-smooth-navigate';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';
import LayoutGame from '~/routes/layout-game';
import { Components } from '~/routes/sing-a-song/song-selection/components/custom-virtualization';
import { SongCard } from '~/routes/sing-a-song/song-selection/components/song-card';
import { SongGroupHeader } from '~/routes/sing-a-song/song-selection/components/song-group-header';
import SongGroupsNavigation from '~/routes/sing-a-song/song-selection/components/song-groups-navigation';
import SongPreview from '~/routes/sing-a-song/song-selection/components/song-preview';
import Toolbar from '~/routes/sing-a-song/song-selection/components/toolbar';
import {
  VirtualizedList,
  VirtualizedListMethods,
} from '~/routes/sing-a-song/song-selection/components/virtualized-list';
import useSongSelection from '~/routes/sing-a-song/song-selection/hooks/use-song-selection';
import { getSongIdWithNew } from '~/routes/sing-a-song/song-selection/utils/get-song-id-with-new';
import { cn } from '~/utils/cn';

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

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
  const setlist = useSetlist();
  const [additionalSong, setAdditionalSong] = useState<string | null>(preselectedSong);
  const list = useRef<VirtualizedListMethods | null>(null);
  const { width, handleResize } = useViewportSize();

  // Breakpoints: <640px → 1 card, 640–719px → 2 cards, ≥720px → 3 cards (max 3 per row)
  const songsPerRow = width < 640 ? 1 : width < 720 ? 2 : 3;
  // Gap and padding scale linearly with viewport width (capped at 1440px content width)
  const effectiveWidth = Math.min(width, 1440);
  const LIST_GAP_PX = Math.max(8, Math.round(effectiveWidth * 0.02));
  const LIST_PADDING_PX = Math.max(8, Math.round(effectiveWidth * 0.02));

  useBackgroundMusic(false);
  useBackground(true);
  useBlockScroll();
  const {
    focusedSong,
    moveToSong,
    groupedSongList,
    keyboardControl,
    toolbarFocusMode,
    row1Register,
    row2Register,
    onPlaylistSelectedInToolbar,
    songPreview,
    setKeyboardControl,
    setFilters,
    filters,
    showFilters,
    isLoading,
    sharedSongsLoading,
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

  const listWidth = effectiveWidth - LIST_PADDING_PX * 2;
  const songEntryWidth = (listWidth - (songsPerRow - 1) * LIST_GAP_PX) / songsPerRow;
  // Portrait card: 16:9 thumbnail on top + fixed-height text section below
  const CARD_METADATA_HEIGHT_PX = 120;
  const songEntryHeight = songEntryWidth * (9 / 16) + CARD_METADATA_HEIGHT_PX;
  const songGroupHeight = songEntryHeight / 2.5;

  const expandSong = useCallback(() => setKeyboardControl(false), [setKeyboardControl]);

  const loading = isLoading || sharedSongsLoading || !groupedSongList || !width;
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

  const [{ previewTop, previewLeft }, setPreviewPosition] = useState(() => ({
    previewTop: 0,
    previewLeft: 0,
  }));
  useEffect(() => {
    const song = document.querySelector<HTMLDivElement>(`[data-song-id="${focusedSong}"]`);
    if (!isLoading && song) {
      const position = list.current?.getSongPosition(focusedSong);
      setPreviewPosition({
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
  useHotkeys(
    'Shift + E',
    () => {
      if (document.fullscreenElement !== null) {
        document.exitFullscreen().catch(console.warn);
      }
      if (songPreview?.isUnverifiedSharedSong && songPreview.externalSongId) {
        navigate(
          buildUrl(`edit/song/`, {
            playlist: null,
            step: 'sync',
            song: null,
            externalSong: songPreview.externalSongId,
          }),
        );
      } else {
        navigate(
          buildUrl(`edit/song/`, {
            playlist: null,
            step: 'metadata',
            externalSong: null,
          }),
        );
      }
    },
    [navigate, songPreview],
  );

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
        className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-[#2575cf] via-[#1a5dab] to-[#144a8a]"
        style={
          {
            '--song-group-header-height': `${Math.floor(songGroupHeight)}px`,
            '--song-entry-width': `${Math.floor(songEntryWidth)}px`,
            '--song-entry-height': `${Math.floor(songEntryHeight)}px`,
            '--song-list-gap': `${LIST_GAP_PX}px`,
            '--song-list-padding-left': `${LIST_PADDING_PX}px`,
            '--song-list-padding-right': `${LIST_PADDING_PX}px`,
          } as React.CSSProperties
        }>
        <div className="fixed top-0 right-0 left-0 z-100 flex flex-col border-b border-white/10 bg-slate-950/50 pt-2 pb-2 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-360 flex-col gap-2 pr-(--song-list-padding-right) pl-(--song-list-padding-left)">
            <Toolbar
              filters={filters}
              setFilters={setFilters}
              onRandom={randomSong}
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              setSelectedPlaylist={setSelectedPlaylist}
              keyboardControl={keyboardControl}
              keyboardNavRegister={row1Register}
              onPlaylistSelected={onPlaylistSelectedInToolbar}
              toolbarNavActive={toolbarFocusMode}
            />
            <SongGroupsNavigation
              containerRef={container}
              groupedSongList={loading ? [] : groupedSongList}
              keyboardNavRegister={row2Register}
              onScrollToGroup={(group) => {
                if (group.songs.length === 0) return;

                moveToSong(getSongIdWithNew(group.songs[0], group));
                // wait for the song to be selected and scrolled into view - then override the scroll and scroll to the group instead
                setTimeout(() => list.current?.scrollToGroup(group.name), 20);
              }}
            />
          </div>
        </div>
        <div
          className={`relative flex-1 overflow-auto transition-opacity duration-500 ${showFilters || toolbarFocusMode ? 'opacity-50' : ''}`}
          data-test="song-list-container"
          ref={container}>
          {loading ? (
            <div style={{ paddingTop: 80 }}>
              <GroupRow>
                <SongGroupHeader />
              </GroupRow>
              {new Array(sharedSongsLoading ? 1 : 4).fill(0).map((_, i) => (
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
            </div>
          ) : (
            <VirtualizedList
              focusedSong={focusedSong}
              topPadding={80}
              ListRowWrapper={ListRow}
              GroupRowWrapper={GroupRow}
              ref={list}
              groups={groupedSongList}
              itemHeight={Math.floor(songEntryHeight) + LIST_GAP_PX}
              groupHeight={Math.floor(songGroupHeight) + LIST_GAP_PX}
              components={components}
              renderGroup={(group) => <SongGroupHeader key={group.name} group={group} />}
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
                  onExpand: expandSong,
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
                  <div className="typography mt-auto pt-20 text-center text-lg text-white sm:text-xl">
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

const ListRow = ({ children, ...props }: ComponentProps<'div'>) => (
  <div {...props} className={`relative mb-(--song-list-gap) ${props.className ?? ''}`}>
    <div className="mx-auto flex max-w-360 flex-nowrap gap-(--song-list-gap) pr-(--song-list-padding-right) pl-(--song-list-padding-left)">
      {children}
    </div>
  </div>
);

const GroupRow = ({ children, ...props }: ComponentProps<'div'>) => (
  <div {...props} className={`mb-(--song-list-gap) ${props.className ?? ''}`}>
    <div className="mx-auto flex max-w-360 flex-nowrap gap-(--song-list-gap) pr-(--song-list-padding-right) pl-(--song-list-padding-left)">
      {children}
    </div>
  </div>
);

interface SongListEntryProps extends ComponentProps<typeof SongCard> {
  focused: boolean;
  songId?: string;
  groupLetter?: string;
  handleClick?: (songId: string, groupLetter?: string) => void;
}

const SongListEntry = memo(({ focused: isFocused, songId, groupLetter, handleClick, ...props }: SongListEntryProps) => {
  const onClickCallback = useCallback(
    () => (handleClick ? handleClick(songId!, groupLetter) : undefined),
    [handleClick, songId, groupLetter],
  );

  return (
    <SongCard
      {...props}
      focused={isFocused}
      onClick={handleClick ? onClickCallback : undefined}
      className={cn(
        'flex-none cursor-pointer transition-all duration-300',
        isFocused ? 'z-2' : 'hover:border-white/20',
        props.className,
      )}
      style={{
        flexBasis: 'var(--song-entry-width)',
        width: 'var(--song-entry-width)',
        height: 'var(--song-entry-height)',
        ...props.style,
      }}>
      <SongCard.Thumbnail />
      <SongCard.Footer>
        <SongCard.SongTitle />
        <SongCard.Artist />
        <SongCard.Badges>
          <SongCard.Badges.Flag />
          <SongCard.Badges.Duet />
          <SongCard.Badges.Stats compact />
        </SongCard.Badges>
      </SongCard.Footer>
    </SongCard>
  );
});
SongListEntry.displayName = 'SongListEntry';

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
    <div className="typography flex h-[30vh] flex-1 items-center justify-center text-xl text-white sm:text-4xl">
      No songs found
    </div>
  ),
};
