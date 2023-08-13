import styled from '@emotion/styled';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import { WebRTCSongListEvent } from 'RemoteMic/Network/events';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import SongDao from 'Songs/SongsService';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { uniqBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

interface Props {
    roomId: string;
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

    const [overrides, setOverrides] = useState<WebRTCSongListEvent | undefined>();
    useEffect(() => {
        if (connectionStatus === 'connected' && overrides === undefined) {
            RemoteMicClient.getSongList().then(setOverrides);
        }
    }, [overrides, connectionStatus]);

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
                    }))
                    .concat(
                        ...(overrides?.custom ?? []).map((song) => ({ ...song, id: SongDao.generateSongFile(song) })),
                    ),
                (song) => song.id,
            ),
        [originalSongList.data, overrides],
    );

    return (
        <Container>
            {songList.map((song) => {
                const language = Array.isArray(song.language) ? song.language[0] : song.language!;

                return (
                    <SongItemContainer key={`${song.artist}-${song.title}`} data-test={song.id}>
                        <Language>
                            <img src={`https://flagcdn.com/${languageNameToIsoCode(language)}.svg`} alt={language} />
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

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 5rem;
`;

const SongItemContainer = styled.div`
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1rem;
    border-bottom: 1px solid black;
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
    overflow: hidden;
    font-weight: bold;
    text-overflow: ellipsis;
`;
const Title = styled.span`
    color: ${styles.colors.text.active};

    font-size: 1.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
