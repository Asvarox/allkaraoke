import { isNil, omitBy } from 'lodash';
import { ExtractOptional, Note, NotesSection, Section, Song } from '../../interfaces';

export const typesMap: Record<string, Note['type']> = {
    R: 'rap',
    F: 'freestyle',
    '*': 'star',
    ':': 'normal',
};

function getPropertyValueFromTxt(txt: string, key: string): string | undefined {
    const regex = new RegExp(`#${key}\\:(.*)`);

    return txt.match(regex)?.[1] ?? undefined;
}

const LINE_BREAK_RELATIVE_REGEXP = /- \d+ \d+/;

export default function convertTxtToSong(
    text: string,
    videoLink: string,
    author: string,
    authorUrl: string,
    sourceUrl: string,
): Song {
    const additionalData: ExtractOptional<Song> = omitBy(
        {
            year: getPropertyValueFromTxt(text, 'YEAR'),
            edition: getPropertyValueFromTxt(text, 'EDITION'),
            genre: getPropertyValueFromTxt(text, 'GENRE'),
            language: getPropertyValueFromTxt(text, 'LANGUAGE'),
            videoGap: Math.floor(Number(getPropertyValueFromTxt(text, 'VIDEOGAP')?.replace(',', '.') ?? 0)),
            author: author || getPropertyValueFromTxt(text, 'CREATOR'),
            authorUrl,
            sourceUrl,
        },
        isNil,
    );
    const song: Song = {
        title: getPropertyValueFromTxt(text, 'TITLE') ?? '',
        artist: getPropertyValueFromTxt(text, 'ARTIST') ?? '',
        bpm: Number(getPropertyValueFromTxt(text, 'BPM')?.replace(',', '.') ?? 0),
        bar: 4,
        gap: Number(getPropertyValueFromTxt(text, 'GAP')?.replace(',', '.') ?? 0),
        video: '',
        ...additionalData,
        tracks: [],
    };

    if (author) song.author = author;
    if (authorUrl) song.authorUrl = authorUrl;
    if (sourceUrl) song.sourceUrl = sourceUrl;

    try {
        const linkUrl = new URL(videoLink);
        song.video = linkUrl.searchParams.get('v') || 'Invalid link';
    } catch (e: any) {
        song.video = `Invalid link: ${e.message}`;
    }

    let sections: Section[] = [{ start: 0, notes: [], type: 'notes' }];
    let lastStart = 0;

    text.split('\n').forEach((line) => {
        if (line.startsWith('#')) return;
        const split = line.split(' ');

        if (Number(split[1]) < lastStart) {
            // new track (song is a duet)
            song.tracks.push({ sections });
            sections = [{ start: 0, notes: [], type: 'notes' }];
        }

        if (LINE_BREAK_RELATIVE_REGEXP.test(line)) {
            // "Pause" or relative line break
            const [, start, end] = split;
            sections.push({ start: Number(start), end: Number(end), type: 'pause' });
            sections.push({ start: Number(end), type: 'notes', notes: [] });
        } else if (line.startsWith('-')) {
            // new section
            sections.push({ start: Number(line.split('-')[1].trim()), notes: [], type: 'notes' });
        } else if (Object.keys(typesMap).includes(line[0])) {
            // Note
            const lastSection = sections[sections.length - 1];

            const [type, start, length, pitch, ...lyrics] = split;

            (lastSection as NotesSection).notes.push({
                type: typesMap[type as 'R' | '*' | ':'] ?? 'normal',
                start: Number(start),
                length: Number(length),
                pitch: Number(pitch),
                lyrics: lyrics.join(' '),
            });
            lastStart = Number(split[1]);
        }
    });

    song.tracks.push({ sections });

    return song;
}
