import styled from '@emotion/styled';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { WebRTCSongListEvent } from 'RemoteMic/Network/events';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import SongDao from 'Songs/SongDao';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { PeerErrorType } from 'interfaces';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    roomId: string;
    connectionStatus: ConnectionStatuses;
    connectionError?: PeerErrorType;
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
        WebRTCClient.getSongList().then(setOverrides);
    }, []);

    const songList = useMemo(
        () =>
            originalSongList.data
                .filter((song) => !(overrides?.deleted ?? []).includes(SongDao.generateSongFile(song)))
                .map((song) => ({
                    artist: song.artist,
                    title: song.title,
                    video: song.video,
                }))
                .concat(...(overrides?.custom ?? [])),
        [originalSongList.data, overrides],
    );

    return (
        <Container>
            {songList.map((song) => (
                <SongItemContainer key={`${song.artist}-${song.title}`}>
                    <Title>{song.title}</Title>
                    <Artist>{song.artist}</Artist>
                </SongItemContainer>
            ))}
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem 1rem;
    border-bottom: 1px solid black;
`;

const Artist = styled.span`
    color: ${styles.colors.text.default};
    font-size: 1.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const Title = styled.span`
    color: ${styles.colors.text.active};

    font-size: 1.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
