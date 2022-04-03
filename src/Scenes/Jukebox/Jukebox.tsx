import { shuffle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { Link } from 'wouter';
import { Button } from '../../Elements/Button';
import { navigate } from '../../Hooks/useHashLocation';
import useKeyboard from '../../Hooks/useKeyboard';
import useUnstuckYouTubePlayer from '../../Hooks/useUnstuckYouTubePlayer';
import useViewportSize from '../../Hooks/useViewportSize';
import { SongPreview } from '../../interfaces';
import usePlayerVolume from '../Game/hooks/usePlayerVolume';
import SongPage from '../Game/SongPage';

interface Props {}

function Jukebox(props: Props) {
    const { width, height } = useViewportSize();
    const player = useRef<YouTube | null>(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(0);
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

    const [shuffledList, setShuffledList] = useState<SongPreview[]>([]);
    const { register } = useKeyboard(true, () => {
        navigate('/');
    });

    useEffect(() => songList.data && setShuffledList(shuffle(songList.data)), [songList.data]);

    const playNext = () => songList.data && setCurrentlyPlaying((current) => (current + 1) % songList.data.length);

    usePlayerVolume(player, shuffledList[currentlyPlaying]?.volume);
    useEffect(() => {
        if (!player.current) {
            return;
        }

        player.current.getInternalPlayer().setSize(width, height);
    }, [player, width, height, shuffledList, currentlyPlaying]);
    const playerKey = useUnstuckYouTubePlayer(player, currentStatus);

    if (!shuffledList.length || !width || !height) return null;

    const navigateUrl = `/game/${encodeURIComponent(shuffledList[currentlyPlaying].file)}`;

    return (
        <SongPage
            width={width}
            height={height}
            songData={shuffledList[currentlyPlaying]}
            background={
                <YouTube
                    key={playerKey}
                    ref={player}
                    videoId={shuffledList[currentlyPlaying].video}
                    opts={{
                        width: '0',
                        height: '0',
                        playerVars: {
                            autoplay: 1,
                            showinfo: 1,
                            rel: 0,
                            fs: 0,
                            controls: 1,
                            start: shuffledList[currentlyPlaying].videoGap ?? 0,
                        },
                    }}
                    onStateChange={(e) => {
                        if (e.data === YouTube.PlayerState.ENDED) playNext();
                        setCurrentStatus(e.data);
                    }}
                />
            }>
            <SkipSongButton {...register('skip', playNext)}>Skip</SkipSongButton>
            <Link to={navigateUrl}>
                <PlayThisSongButton {...register('sing a song', () => navigate(navigateUrl), true)}>
                    Sing this song
                </PlayThisSongButton>
            </Link>
        </SongPage>
    );
}

const PlayThisSongButton = styled(Button)<{ focused: boolean }>`
    bottom: 70px;
    right: 20px;
    width: 500px;
    position: absolute;
    font-size: 1.9vw;
`;

const SkipSongButton = styled(Button)<{ focused: boolean }>`
    bottom: 150px;
    right: 20px;
    width: 300px;
    position: absolute;
    font-size: 1.9vw;
`;

export default Jukebox;
