import styled from '@emotion/styled';
import { Search } from '@mui/icons-material';
import { uniqBy } from 'lodash-es';
import { Flag } from 'modules/Elements/Flag';
import { Input } from 'modules/Elements/Input';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { NetworkSongListMessage } from 'modules/RemoteMic/Network/messages';
import SongDao from 'modules/Songs/SongsService';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import useBaseUnitPx from 'modules/hooks/useBaseUnitPx';
import { useEffect, useMemo, useState } from 'react';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
import { CustomVirtualization } from 'routes/SingASong/SongSelection/Components/CustomVirtualization';
import { searchList } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}

function RemoteSongList({
  roomId,
  monitoringStarted,
  setMonitoringStarted,
  isKeepAwakeOn,
  setIsKeepAwakeOn,
  connectionError,
  connectionStatus,
}: Props) {
  const originalSongList = useSongIndex();

  const [overrides, setOverrides] = useState<NetworkSongListMessage | undefined>();
  useEffect(() => {
    if (connectionStatus === 'connected' && overrides === undefined) {
      RemoteMicClient.getSongList().then(setOverrides).catch(console.warn);
    }
  }, [overrides, connectionStatus]);

  const [search, setSearch] = useState('');

  const songList = useMemo(
    () =>
      uniqBy(
        originalSongList.data
          .map((song) => ({ ...song, id: SongDao.generateSongFile(song) }))
          .filter((song) => !(overrides?.deleted ?? []).includes(song.id))
          .map((song) => ({
            id: song.id,
            artist: song.artist,
            title: song.title,
            video: song.video,
            language: song.language,
            search: song.search,
          }))
          .concat(...(overrides?.custom ?? []).map((song) => ({ ...song, id: SongDao.generateSongFile(song) }))),
        (song) => song.id,
      ),
    [originalSongList.data, overrides],
  );

  const [addedSongs, setAddedSongs] = useState<string[]>([]);
  const [tab, setTab] = useState<'list' | 'queue'>('list');
  const finalSongList = useMemo(() => {
    return searchList(songList, search);
  }, [search, songList]);

  const unit = useBaseUnitPx();

  const toggleSong = (songId: string) => {
    if (addedSongs.includes(songId)) {
      setAddedSongs((current) => current.filter((id) => id !== songId));
    } else {
      setAddedSongs((current) => [...current, songId]);
    }
  };

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
          <Tab data-active={tab === 'list'} onClick={() => setTab('list')}>
            All songs
          </Tab>
          <Tab data-active={tab === 'queue'} onClick={() => setTab('queue')}>
            Your list
          </Tab>
        </Tabs>
      </TopBar>
      <CustomVirtualization
        forceRenderItem={-1}
        overScan={100}
        components={{}}
        context={{}}
        groupSizes={[finalSongList.length]}
        groupHeaderHeight={1}
        groupContent={() => null}
        itemHeight={unit * 7 + 1}
        itemContent={(index, groupIndex, itemProps) => {
          const song = tab === 'list' ? finalSongList[index] : songList.find((song) => song.id === addedSongs[index]);

          if (!song) {
            return null;
          }

          const isOnList = addedSongs.includes(song.id);

          return (
            <SongItemContainer
              data-test={song.id}
              {...itemProps}
              onClick={() => (tab === 'list' ? toggleSong(song.id) : toggleSong(song.id))}>
              <Language>
                <Flag language={song.language} />
              </Language>
              <ArtistTitle>
                <Title>{song.title}</Title>
                <Artist>{song.artist}</Artist>
              </ArtistTitle>
              <Action>
                {isOnList ? (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddedSongs((current) => current.filter((id) => id !== song.id));
                    }}>
                    Remove
                  </ActionButton>
                ) : (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddedSongs((current) => [...current, song.id]);
                    }}>
                    Add
                  </ActionButton>
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
  height: 4rem;
  background: rgba(0, 0, 0, 0.75);
  ${typography};
  font-size: 2rem;

  &[data-active='true'] {
    background: ${styles.colors.text.active};
  }

  &[data-active='false'] {
    box-shadow: inset 0px 0px 0px 2px orange;
  }
`;

const SongItemContainer = styled.div`
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  height: 7rem;
  padding: 0 1rem;
  gap: 1rem;
  border-bottom: 1px solid black;
  overflow: hidden;

  position: relative;
`;

const Language = styled.div`
  img {
    height: 3rem;
    width: 3rem;
    object-fit: cover;
    border-radius: 3rem;
    border: 0.1rem black solid;
    aspect-ratio: 1;
  }
`;

const ArtistTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
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
`;

const ActionButton = styled.button``;
