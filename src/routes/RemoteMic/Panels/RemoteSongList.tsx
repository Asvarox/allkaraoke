import styled from '@emotion/styled';
import { ArrowRight, Search } from '@mui/icons-material';
import { SongPreview } from 'interfaces';
import { groupBy, uniqBy } from 'lodash-es';
import { Badge } from 'modules/Elements/Badge';
import { Flag } from 'modules/Elements/Flag';
import { Input } from 'modules/Elements/Input';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { NetworkSongListMessage } from 'modules/RemoteMic/Network/messages';
import SongDao from 'modules/Songs/SongsService';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import useBaseUnitPx from 'modules/hooks/useBaseUnitPx';
import isE2E from 'modules/utils/isE2E';
import { ReactEventHandler, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { twc } from 'react-twc';
import { useLanguageList } from 'routes/ExcludeLanguages/ExcludeLanguagesView';
import LanguageFilter from 'routes/RemoteMic/Panels/RemoteSongList/LanguageFilter';
import { useMySongList } from 'routes/RemoteMic/Panels/RemoteSongList/useMySongList';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
import usePermissions from 'routes/RemoteMic/hooks/usePermissions';
import { CustomVirtualization } from 'routes/SingASong/SongSelection/Components/CustomVirtualization';
import { searchList } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';
import createPersistedState from 'use-persisted-state';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}
export const useExcludedLanguages = createPersistedState<string[]>('remote-mic-excluded-languages');
export const useSelectedList = createPersistedState<'list' | 'queue'>('remote-mic-selected-song-list');
export const useSearchState = createPersistedState<string>('remote-mic-song-list-search');

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
    <Container>
      <TopBar>
        <Input
          focused={false}
          label={<Search />}
          placeholder="Search for a song…"
          value={search}
          onChange={(value) => setSearch(value)}
          data-test="search-input"
        />
        <Tabs>
          <Tab data-test="all-songs-button" data-active={tab === 'list'} onClick={() => changeTab('list')}>
            All songs
          </Tab>
          <Tab data-test="your-list-button" data-active={tab === 'queue'} onClick={() => changeTab('queue')}>
            Your list ({savedSongList.length})
          </Tab>
          <LanguageFilter
            excludedLanguages={excludedLanguages}
            languageList={languages}
            onListChange={setExcludedLanguages}>
            {({ open }) => (
              <Tab
                className="!flex-grow-[0.3]"
                onClick={open}
                data-test="song-language-filter"
                data-active={excludedLanguages.length > 0 && tab === 'list' ? true : undefined}>
                🇺🇳{selectedLanguages < languages.length && <Badge>{selectedLanguages}</Badge>}
              </Tab>
            )}
          </LanguageFilter>
        </Tabs>
      </TopBar>
      <CustomVirtualization
        forceRenderItem={-1}
        overScan={200}
        components={{}}
        context={{}}
        groupSizes={[itemsToRender.length]}
        groupHeaderHeight={1}
        groupContent={() => null}
        itemHeight={unit * 7 + 1}
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
              <SongItemContainer
                role="button"
                className="cursor-pointer !bg-black !bg-opacity-75 active:!bg-opacity-100"
                data-test={`song-group-${mainArtistName}`}
                onClick={onClick}
                {...itemProps}>
                <Language>
                  <ArrowRight
                    className={`text-white !transition-transform !duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </Language>
                <ArtistTitle>
                  <Title>{mainArtistName}</Title>
                  <Artist data-test={'songs-count'} data-value={`${song.length}`}>
                    {song.length} songs
                  </Artist>
                </ArtistTitle>
                <Action>
                  {isExpanded ? (
                    <ActiveButton data-test="remove-song-button">CLOSE</ActiveButton>
                  ) : (
                    <AddButton data-test="add-song-button">EXPAND</AddButton>
                  )}
                </Action>
              </SongItemContainer>
            );
          }

          const isExpanded = isArtistPresent(getMainArtistName(song.artist), expandedArtists);
          const isOnList = savedSongList.includes(song.id);

          return (
            <SongItemContainer
              className={isOnList ? '!bg-black !bg-opacity-35' : ''}
              data-test={song.id}
              {...itemProps}>
              {isExpanded && <Language />}
              <Language>
                <Flag language={song.language} />
              </Language>
              <ArtistTitle>
                <Title>{song.title}</Title>
                <Artist>{song.artist}</Artist>
              </ArtistTitle>
              <Action>
                {keyboard?.remote?.includes('select-song') && permissions === 'write' && (
                  <ActiveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      RemoteMicClient.selectSong(song.id);
                    }}
                    data-test="select-song-button">
                    SELECT
                  </ActiveButton>
                )}
                {isOnList ? (
                  <ActiveButton
                    data-test="remove-song-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSong(song.id);
                    }}>
                    -
                  </ActiveButton>
                ) : (
                  <AddButton
                    data-test="add-song-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSong(song.id);
                    }}>
                    +
                  </AddButton>
                )}
              </Action>
            </SongItemContainer>
          );
        }}
      />
    </Container>
  );
}
export default RemoteSongList;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1 1 auto;
  min-height: calc(100vh - 6rem);
  max-height: calc(100vh - 6rem);
`;

const TopBar = styled.div`
  ${typography};
  font-size: 2.5rem;
  display: flex;
  flex-direction: column;
`;

const Tabs = styled.div`
  display: flex;
  width: 100%;
`;
const Tab = styled.button`
  border: none;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  height: 4rem;
  background: rgba(0, 0, 0, 0.75);
  ${typography};
  font-size: 2rem;
  position: relative;

  transition: 300ms;
  &[data-active='true'] {
    background: ${styles.colors.text.active};
  }

  &[data-active='false'] {
    box-shadow: inset 0px 0px 0px 2px orange;
  }
`;

const SongItemContainer = styled.div`
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  height: 7rem;
  padding: 0 1rem;
  gap: 1rem;
  border-bottom: 1px solid black;
  overflow: hidden;

  position: relative;
  transition: 100ms;
`;

const Language = styled.div`
  min-width: 3rem;
  img,
  svg {
    height: 3rem;
    width: 3rem;
    object-fit: cover;
    border-radius: 3rem;
    aspect-ratio: 1;
  }
`;

const ArtistTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  overflow: hidden;
`;

const Artist = styled.span`
  color: ${styles.colors.text.default};
  font-size: 1.25rem;
  white-space: nowrap;
`;
const Title = styled.span`
  color: ${styles.colors.text.active};

  font-size: 1.5rem;
  white-space: nowrap;
`;

const Action = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  height: 7rem;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-right: 1rem;
`;

const AddButton = twc.button`transition-all duration-300 active:text-text-default active:bg-active typography p-[1rem] min-w-[4rem] h-[4rem] rounded-full text-center bg-black text-[1.5rem] border-none cursor-pointer transition-[300ms]`;
const ActiveButton = twc(AddButton)`text-active`;
