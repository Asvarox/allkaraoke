import styled from '@emotion/styled';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { WebRTCSongListEvent } from 'RemoteMic/Network/events';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import SongDao from 'Songs/SongDao';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { PeerErrorType } from 'interfaces';
import { uniqBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

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
            uniqBy(
                originalSongList.data
                    .filter((song) => !(overrides?.deleted ?? []).includes(SongDao.generateSongFile(song)))
                    .map((song) => ({
                        artist: song.artist,
                        title: song.title,
                        video: song.video,
                        language: song.language,
                    }))
                    .concat(...(overrides?.custom ?? [])),
                SongDao.generateSongFile,
            ),
        [originalSongList.data, overrides],
    );

    return (
        <Container>
            {songList.map((song) => {
                const language = Array.isArray(song.language) ? song.language[0] : song.language!;

                return (
                    <SongItemContainer key={`${song.artist}-${song.title}`}>
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    //justify-content: space-between;
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
    text-overflow: ellipsis;
`;
const Title = styled.span`
    color: ${styles.colors.text.active};

    font-size: 1.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
