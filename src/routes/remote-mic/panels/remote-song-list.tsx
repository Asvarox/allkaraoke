import { ArrowRight } from '@mui/icons-material';
import { groupBy, uniqBy } from 'es-toolkit';
import { ComponentProps, ReactEventHandler, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import createPersistedState from 'use-persisted-state';
import { SongPreview } from '~/interfaces';
import { Flag } from '~/modules/elements/flag';
import useBaseUnitPx from '~/modules/hooks/use-base-unit-px';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import { useLanguageList } from '~/modules/songs/hooks/use-language-list';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import isE2E from '~/modules/utils/is-e2-e';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import SongListToolbar from '~/routes/remote-mic/panels/remote-song-list/song-list-toolbar';
import { useMySongList } from '~/routes/remote-mic/panels/remote-song-list/use-my-song-list';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';
import { CustomVirtualization } from '~/routes/sing-a-song/song-selection/components/custom-virtualization';
import { searchList } from '~/routes/sing-a-song/song-selection/hooks/use-song-list-filter';
import { cn } from '~/utils/cn';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}
const useExcludedLanguages = createPersistedState<string[]>('remote-mic-excluded-languages');
const useSelectedList = createPersistedState<'list' | 'queue'>('remote-mic-selected-song-list');
const useSearchState = createPersistedState<string>('remote-mic-song-list-search');

const getMainArtistName = (artist: string) => artist.split(' feat')[0];
const isArtistPresent = (a: string, b: string[]) => b.some((artist) => artist.toLowerCase() === a.toLowerCase());

function RemoteSongList({ connectionStatus }: Props) {
  const keyboard = useSubscription('keyboard-layout');
  const permissions = usePermissions();
  const originalSongList = useSongIndex();
  const [tab, setTab] = useSelectedList('list');
  const [search, setSearch] = useSearchState('');
  const [excludedLanguages, setExcludedLanguages] = useExcludedLanguages([]);
  const { savedSongList, toggleSong } = useMySongList();

  type SongListOverrides = Awaited<ReturnType<typeof serverRpc.songs.getSongList>>;
  const [overrides, setOverrides] = useState<SongListOverrides | undefined>();
  const [fetchError, setFetchError] = useState(false);
  // Reset the error flag when the connection is re-established so fetch is retried
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setFetchError(false);
    }
  }, [connectionStatus]);
  useEffect(() => {
    if (connectionStatus === 'connected' && overrides === undefined && !fetchError) {
      serverRpc.songs
        .getSongList()
        .then(setOverrides)
        .catch((err) => {
          console.warn(err);
          setFetchError(true);
        });
    }
  }, [overrides, connectionStatus, fetchError]);

  const songList = useMemo(
    () =>
      uniqBy(
        originalSongList.data
          .map((song) => ({ ...song, id: SongDao.generateSongFile(song) }))
          .filter((song) => !(overrides?.deleted ?? []).includes(song.id))
          .map(
            (song) =>
              ({
                id: song.id,
                artist: song.artist,
                title: song.title,
                video: song.video,
                language: song.language,
                search: song.search,
              }) as SongListOverrides['custom'][number] & Pick<SongPreview, 'id'>,
          )
          .concat(...(overrides?.custom ?? []).map((song) => ({ ...song, id: SongDao.generateSongFile(song) }))),
        (song) => song.id,
      ),
    [originalSongList.data, overrides],
  );

  const changeTab = (tab: 'list' | 'queue') => {
    setTab(tab);
    setSearch('');
  };
  const filteredSongList = useMemo(() => {
    if (tab === 'list') {
      const searchedList = searchList(songList, search);
      if (searchedList.length !== songList.length) {
        return searchedList;
      } else {
        return songList.filter(
          (song) => !song.language.every((songLang: string | null) => excludedLanguages.includes(songLang!)),
        );
      }
    } else {
      const addedSongList = savedSongList.map((id) => songList.find((song) => song.id === id)!).filter(Boolean);
      return searchList(addedSongList, search);
    }
  }, [search, songList, tab, savedSongList, excludedLanguages]);

  const groupedSongList = useMemo(() => {
    if (filteredSongList.length < (isE2E() ? 5 : 500)) {
      return filteredSongList;
    }
    const groups = groupBy(filteredSongList, (song) => getMainArtistName(song.artist).toLowerCase());

    return Object.values(groups)
      .map((group) => (group.length >= (isE2E() ? 2 : 3) ? [group] : group))
      .flat();
  }, [filteredSongList]);

  const [expandedArtists, setExpandedArtists] = useState<string[]>([]);
  useLayoutEffect(() => {
    setExpandedArtists([]);
  }, [search, songList, tab, excludedLanguages]);

  const itemsToRender = useMemo(() => {
    const itemsToRender: typeof groupedSongList = [];

    for (const song of groupedSongList) {
      itemsToRender.push(song);
      if (Array.isArray(song) && expandedArtists.includes(getMainArtistName(song[0].artist))) {
        itemsToRender.push(...song);
      }
    }
    return itemsToRender;
  }, [groupedSongList, expandedArtists]);

  const languages = useLanguageList(songList);

  const unit = useBaseUnitPx();

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-auto flex-col overflow-hidden">
      <SongListToolbar
        search={search}
        onSearchChange={setSearch}
        tab={tab}
        onTabChange={changeTab}
        savedSongCount={savedSongList.length}
        excludedLanguages={excludedLanguages}
        onExcludedLanguagesChange={setExcludedLanguages}
        languages={languages}
      />
      <CustomVirtualization
        forceRenderItem={-1}
        Footer={<div style={{ height: unit * 3.75 }} className="landscap:block hidden" />}
        overScan={200}
        components={{}}
        context={{}}
        groupSizes={[itemsToRender.length]}
        groupHeaderHeight={1}
        groupContent={() => null}
        itemHeight={unit * 3.75}
        itemContent={(index, _groupIndex, itemProps) => {
          const song = itemsToRender[index];

          if (Array.isArray(song)) {
            const mainArtistName = getMainArtistName(song[0].artist);
            const isExpanded = isArtistPresent(mainArtistName, expandedArtists);
            const onClick: ReactEventHandler = (e) => {
              e.stopPropagation();
              if (isExpanded) {
                setExpandedArtists((artists) => artists.filter((artist) => artist !== mainArtistName));
              } else {
                setExpandedArtists((artists) => [...artists, mainArtistName]);
              }
            };

            return (
              <SongListItem
                className="overflow-hidden border-b border-black bg-black/60 active:bg-black/100"
                data-test={`song-group-${mainArtistName}`}
                data-song-count={song.length}
                onClick={onClick}
                left={
                  <ArrowRight
                    className={`text-white transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                }
                topText={mainArtistName}
                bottomText={`${song.length} songs`}
                action={
                  isExpanded ? (
                    <button
                      className={`active:bg-active typography text-active h-8 min-w-8 rounded-full bg-black px-3 text-sm`}
                      data-test="remove-song-button">
                      CLOSE
                    </button>
                  ) : (
                    <button
                      className={`active:bg-active typography h-8 min-w-8 rounded-full bg-black px-3 text-sm`}
                      data-test="add-song-button">
                      EXPAND
                    </button>
                  )
                }
                {...itemProps}
              />
            );
          }

          const isExpanded = isArtistPresent(getMainArtistName(song.artist), expandedArtists);
          const isOnSavedList = savedSongList.includes(song.id);

          return (
            <SongListItem
              className={`${isOnSavedList ? 'bg-black/50' : 'bg-black/30'} ${isExpanded ? 'pl-16' : ''}`}
              data-test={song.id}
              left={<Flag language={song.language} className="h-8 w-8 rounded-full object-cover" />}
              topText={song.title}
              bottomText={song.artist}
              {...itemProps}
              action={
                <>
                  {keyboard?.remote?.includes('select-song') && permissions === 'write' && (
                    <button
                      className={`active:bg-active typography h-8 min-w-8 rounded-full bg-black px-3 text-sm`}
                      onClick={(e) => {
                        e.stopPropagation();
                        void serverRpc.songs.select(song.id);
                      }}
                      data-test="select-song-button">
                      SELECT
                    </button>
                  )}
                  {isOnSavedList ? (
                    <button
                      className={`active:bg-active typography h-8 min-w-8 rounded-full bg-black px-3 text-sm`}
                      data-test="remove-song-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSong(song.id);
                      }}>
                      -
                    </button>
                  ) : (
                    <button
                      className={`active:bg-active typography text-active h-8 min-w-8 rounded-full bg-black px-3 text-sm`}
                      data-test="add-song-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSong(song.id);
                      }}>
                      +
                    </button>
                  )}
                </>
              }
            />
          );
        }}
      />
    </div>
  );
}
export default RemoteSongList;

interface ItemProps extends ComponentProps<'div'> {
  left: React.ReactNode;
  action: React.ReactNode;
  topText: React.ReactNode;
  bottomText: React.ReactNode;
}

const SongListItem = ({ className, left, action, topText, bottomText, ...props }: ItemProps) => {
  return (
    <div
      className={cn(
        `relative flex h-15 items-center gap-4 overflow-hidden border-b border-black bg-black/15 px-3 transition-all duration-100`,
        className,
      )}
      {...props}>
      <div className="flex min-w-8 items-center justify-center">{left}</div>
      <div className="flex flex-col justify-center gap-1 overflow-hidden">
        <span className="text-active text-sm whitespace-nowrap">{topText}</span>
        <span className="text-default text-sm whitespace-nowrap">{bottomText}</span>
      </div>
      <div className="absolute top-0 right-0 bottom-0 flex items-center justify-center gap-4 pr-3">{action}</div>
    </div>
  );
};
