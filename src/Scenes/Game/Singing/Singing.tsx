import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { GAME_MODE, PlayerNote, SingSetup, Song } from '../../../interfaces';
import addHeadstart from '../../Edit/Helpers/addHeadstart';
import normaliseGap from '../../Edit/Helpers/normaliseGap';
import normaliseLyricSpaces from '../../Edit/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from '../../Edit/Helpers/normaliseSectionPaddings';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player from './Player';
import PostGame from './PostGame';
import useWindowSize from './useWindowSize';

interface Props {
    songFile: string;
    singSetup: SingSetup;
    returnToSongSelection: () => void;
}

function Singing({ songFile, singSetup, returnToSongSelection }: Props) {
    const song = useQuery<Song>(`song-${songFile}`, () =>
        fetch(`./songs/${songFile}`).then((response) => response.json()),
    );
    const { width, height } = useWindowSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerNotes, setPlayerNotes] = useState<[PlayerNote[], PlayerNote[]]>([[], []]);

    const newSong = useMemo(() => {
        if (!song.data) return null;
        let processed = normaliseGap(song.data);
        processed = addHeadstart(processed);
        processed = normaliseSectionPaddings(processed);
        processed = normaliseLyricSpaces(processed);

        return processed;
    }, [song]);

    const playerChanges = useMemo(() => {
        if (!newSong) return [];
        if (singSetup.mode !== GAME_MODE.PASS_THE_MIC) return newSong.tracks.map(() => []);

        return generatePlayerChanges(newSong);
    }, [newSong, singSetup]);

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
                playerChanges={playerChanges}
                tracksForPlayers={singSetup.playerTracks}
                song={newSong}
                width={width}
                height={height}
                autoplay
                onSongEnd={(playerNotes) => {
                    setIsEnded(true);
                    setPlayerNotes(playerNotes);
                }}
                singSetup={singSetup}
            />
        );
    }
}

export default Singing;
