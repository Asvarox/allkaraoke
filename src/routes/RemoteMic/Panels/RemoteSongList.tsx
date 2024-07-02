import { styled } from '@linaria/react';
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
import { useEffect, useMemo, useState } from 'react';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
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

  const finalSongList = useMemo(() => {
    return searchList(songList, search);
  }, [search, songList]);

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
      </TopBar>
      {finalSongList.map((song) => {
        return (
          <SongItemContainer key={`${song.artist}-${song.title}`} data-test={song.id}>
            <Language>
              <Flag language={song.language} />
            </Language>
            <ArtistTitle>
              <Title>{song.title}</Title>
              <Artist>{song.artist}</Artist>
            </ArtistTitle>
          </SongItemContainer>
        );
      })}
    </Container>
  );
}
export default RemoteSongList;

const TopBar = styled.div`
  ${typography};
  font-size: 2.5rem;
  display: flex;

  position: fixed;
  top: 0;
  padding-top: 0.5rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 5rem;
  padding-top: 6rem;
  position: relative;
`;

const SongItemContainer = styled.div`
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid black;
  overflow: hidden;
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
