import useWindowSize from './useWindowSize';
import { PlayerNote, Song, SongPreview } from '../../../interfaces';
import { useQuery } from 'react-query';
import Player from './Player';
import PostGame from './PostGame';
import { useState } from 'react';

interface Props {
    songPreview: SongPreview;
    returnToSongSelection: () => void;
}

function Singing({ songPreview, returnToSongSelection }: Props) {
    const song = useQuery<Song>(`song-${songPreview.file}`, () =>
        fetch(`./songs/${songPreview.file}`).then((response) => response.json()),
    );
    const { width, height } = useWindowSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerNotes, setPlayerNotes] = useState<[PlayerNote[], PlayerNote[]]>([[], []]);

    if (!width || !height || !song.data) return <>Loading</>;

    if (isEnded) {
        return (
            <PostGame
                width={width}
                height={height}
                song={song.data}
                playerNotes={playerNotes}
                onClickSongSelection={returnToSongSelection}
            />
        );
    } else {
        return (
            <Player
                song={song.data}
                width={width}
                height={height}
                autoplay
                onSongEnd={(playerNotes) => {
                    setIsEnded(true);
                    setPlayerNotes(playerNotes);
                }}
            />
        );
    }
}

export default Singing;
