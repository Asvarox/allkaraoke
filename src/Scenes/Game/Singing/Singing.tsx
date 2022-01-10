import useWindowSize from './useWindowSize';
import { PlayerNote, SingSetup, Song } from '../../../interfaces';
import { useQuery } from 'react-query';
import Player from './Player';
import PostGame from './PostGame';
import { useMemo, useState } from 'react';
import normaliseGap from '../../Edit/Helpers/normaliseGap';
import normaliseSectionPaddings from '../../Edit/Helpers/normaliseSectionPaddings';

interface Props {
    singSetup: SingSetup;
    returnToSongSelection: () => void;
}

function Singing({ singSetup, returnToSongSelection }: Props) {
    const song = useQuery<Song>(`song-${singSetup.songPreview.file}`, () =>
        fetch(`./songs/${singSetup.songPreview.file}`).then((response) => response.json()),
    );
    const { width, height } = useWindowSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerNotes, setPlayerNotes] = useState<[PlayerNote[], PlayerNote[]]>([[], []]);


    const newSong = useMemo(() => {
        if (!song.data) return null;
        let processed = normaliseGap(song.data);
        processed = normaliseSectionPaddings(processed);

        return processed;
    }, [song]);


    if (!width || !height || !newSong) return <>Loading</>;

    if (isEnded) {
        return (
            <PostGame
                width={width}
                height={height}
                song={newSong}
                playerNotes={playerNotes}
                onClickSongSelection={returnToSongSelection}
                tracksForPlayers={singSetup.playerTracks}
            />
        );
    } else {
        return (
            <Player
                tracksForPlayers={singSetup.playerTracks}
                song={newSong}
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
