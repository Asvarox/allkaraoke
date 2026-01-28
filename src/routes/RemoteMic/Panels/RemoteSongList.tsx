import { ArrowRight, Search } from '@mui/icons-material';
import { groupBy, uniqBy } from 'es-toolkit';
import { ComponentProps, ReactEventHandler, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import createPersistedState from 'use-persisted-state';
import { SongPreview } from '~/interfaces';
import { Button } from '~/modules/Elements/AKUI/Button';
import { Badge } from '~/modules/Elements/Badge';
import { Flag } from '~/modules/Elements/Flag';
import { Input } from '~/modules/Elements/Input';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListener } from '~/modules/GameEvents/hooks';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { transportErrorReason } from '~/modules/RemoteMic/Network/Client/NetworkClient';
import { NetworkSongListMessage } from '~/modules/RemoteMic/Network/messages';
import SongDao from '~/modules/Songs/SongsService';
import { useLanguageList } from '~/modules/Songs/hooks/useLanguageList';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useBaseUnitPx from '~/modules/hooks/useBaseUnitPx';
import isE2E from '~/modules/utils/isE2E';
import LanguageFilter from '~/routes/RemoteMic/Panels/RemoteSongList/LanguageFilter';
import { useMySongList } from '~/routes/RemoteMic/Panels/RemoteSongList/useMySongList';
import { ConnectionStatuses } from '~/routes/RemoteMic/RemoteMic';
import usePermissions from '~/routes/RemoteMic/hooks/usePermissions';
import { CustomVirtualization } from '~/routes/SingASong/SongSelection/Components/CustomVirtualization';
import { searchList } from '~/routes/SingASong/SongSelection/Hooks/useSongListFilter';
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
  const [keyboard] = useEventListener(events.remoteKeyboardLayout, true) ?? [];
  const permissions = usePermissions();
  const originalSongList = useSongIndex();
  const [tab, setTab] = useSelectedList('list');
  const [search, setSearch] = useSearchState('');
  const [excludedLanguages, setExcludedLanguages] = useExcludedLanguages([]);
  const { savedSongList, toggleSong } = useMySongList();

  const [overrides, setOverrides] = useState<NetworkSongListMessage | undefined>();
  useEffect(() => {
    if (connectionStatus === 'connected' && overrides === undefined) {
      RemoteMicClient.getSongList().then(setOverrides).catch(console.warn);
    }
  }, [overrides, connectionStatus]);

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
              }) as NetworkSongListMessage['custom'][number] & Pick<SongPreview, 'id'>,
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
        return songList.filter((song) => !song.language.every((songLang) => excludedLanguages.includes(songLang!)));
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
  const selectedLanguages = languages.length - excludedLanguages.length;

  const unit = useBaseUnitPx();

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-auto flex-col overflow-hidden">
      <div className={`typography flex flex-col bg-black/75 p-1`}>
        <Input
          size="mini"
          className="text-sm"
          focused={false}
          label={<Search className="h-4! w-4!" />}
          placeholder="Search the list…"
          value={search}
          onChange={(value) => setSearch(value)}
          data-test="search-input"
        />
        <div className="flex w-full gap-1">
          <Button
            size="mini"
            className="flex-1 animate-none"
            focused={tab === 'list'}
            data-test="all-songs-button"
            onClick={() => changeTab('list')}>
            All songs
          </Button>
          <Button
            size="mini"
            className="flex-1 animate-none"
            focused={tab === 'queue'}
            data-test="your-list-button"
            onClick={() => changeTab('queue')}>
            Your list ({savedSongList.length})
          </Button>
          <LanguageFilter
            excludedLanguages={excludedLanguages}
            languageList={languages}
            onListChange={setExcludedLanguages}>
            {({ open }) => (
              <Button
                size="mini"
                onClick={open}
                focused={excludedLanguages.length > 0 && tab === 'list'}
                className="scale-100 animate-none"
                data-test="song-language-filter">
                🇺🇳{selectedLanguages < languages.length && <Badge>{selectedLanguages}</Badge>}
              </Button>
            )}
          </LanguageFilter>
        </div>
      </div>
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
                className="overflow-hidden border-b border-black bg-black/75 active:bg-black/100"
                data-test={`song-group-${mainArtistName}`}
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
              className={`${isOnSavedList ? 'bg-black/40' : ''} ${isExpanded ? 'pl-16' : ''}`}
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
                        RemoteMicClient.selectSong(song.id);
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
        `relative flex h-15 items-center gap-4 overflow-hidden border-b border-black bg-black/15 px-4 transition-all duration-100`,
        className,
      )}
      {...props}>
      <div className="flex min-w-8 items-center justify-center">{left}</div>
      <div className="flex flex-col justify-center gap-1 overflow-hidden">
        <span className="text-active text-sm whitespace-nowrap">{topText}</span>
        <span className="text-default text-sm whitespace-nowrap">{bottomText}</span>
      </div>
      <div className="absolute top-0 right-0 bottom-0 flex items-center justify-center gap-4 pr-4">{action}</div>
    </div>
  );
};
