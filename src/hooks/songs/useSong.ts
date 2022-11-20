import { Song } from 'interfaces';
import { useQuery } from 'react-query';
import addHeadstart from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/addHeadstart';
import normaliseGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseGap';
import normaliseLyricSpaces from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseSectionPaddings';

const processSong = (song: Song) => {
    let processed = normaliseGap(song);
    processed = addHeadstart(processed);
    processed = normaliseSectionPaddings(processed);
    processed = normaliseLyricSpaces(processed);

    return processed;
};
export default function useSong(fileName: string) {
    const query = useQuery<Song>(
        ['song', fileName],
        () => fetch(`./songs/${fileName}`).then((response) => response.json()),
        { staleTime: Infinity, select: processSong },
    );

    return {
        data: query.data,
    };
}
