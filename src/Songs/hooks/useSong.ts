import { Song } from 'interfaces';
import addHeadstart from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/addHeadstart';
import normaliseGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseGap';
import normaliseLyricSpaces from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseSectionPaddings';
import { useEffect, useState } from 'react';
import SongDao from 'Songs/SongDao';
import fixVideoGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/fixVideoGap';

const processSong = (song: Song) => {
    let processed = normaliseGap(song);
    processed = addHeadstart(processed);
    processed = normaliseSectionPaddings(processed);
    processed = normaliseLyricSpaces(processed);
    processed = fixVideoGap(processed);

    return processed;
};

export default function useSong(fileName: string) {
    const [song, setSong] = useState<Song | null>(null);

    useEffect(() => {
        SongDao.get(fileName).then((loadedSong) => setSong(loadedSong ? processSong(loadedSong) : loadedSong));
    }, [fileName]);

    return {
        data: song,
    };
}
