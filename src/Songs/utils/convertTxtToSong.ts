import { NotesSection, Section, Song } from 'interfaces';

export const typesMap = {
    R: 'rap',
    F: 'freestyle',
    '*': 'star',
    ':': 'normal',
} as const;

export type SongTXTKeys =
    | 'TRACKNAMES'
    | 'YEAR'
    | 'LASTUPDATE'
    | 'EDITION'
    | 'GENRE'
    | 'LANGUAGE'
    | 'VIDEOGAP'
    | 'REALBPM'
    | 'PREVIEWSTART'
    | 'PREVIEWEND'
    | 'VOLUME'
    | 'CREATOR'
    | 'CREATORURL'
    | 'SOURCEURL'
    | 'TITLE'
    | 'ARTIST'
    | 'BPM'
    | 'GAP'
    | 'VIDEOID';

function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, number?: false): string | undefined;
function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, number?: true): number | undefined;
function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, number = false) {
    const regex = new RegExp(`#${key}\\:(.*)`);

    const value = txt.match(regex)?.[1];
    if (value === undefined) return undefined;
    return number ? Number(value.replace(',', '.')) ?? 0 : value;
}

const LINE_BREAK_RELATIVE_REGEXP = /- -?\d+ -?\d+/;

export function getVideoId(url: string) {
    try {
        const linkUrl = new URL(url);
        return linkUrl.searchParams.get('v') || false;
    } catch (e: any) {
        return false;
    }
}
function safeJsonParse<T extends any, DV extends any = T>(str: any, defaultValue: DV): T | DV {
    try {
        return JSON.parse(str);
    } catch (e) {
        return defaultValue;
    }
}

export default function convertTxtToSong(
    text: string,
    videoLink?: string,
    author?: string,
    authorUrl?: string,
    sourceUrl?: string,
): Song {
    const trackNames: string[] = safeJsonParse<string[]>(getPropertyValueFromTxt(text, 'TRACKNAMES'), []);

    const additionalData = {
        year: getPropertyValueFromTxt(text, 'YEAR'),
        lastUpdate: getPropertyValueFromTxt(text, 'LASTUPDATE'),
        edition: getPropertyValueFromTxt(text, 'EDITION'),
        genre: getPropertyValueFromTxt(text, 'GENRE'),
        language: getPropertyValueFromTxt(text, 'LANGUAGE'),
        videoGap: getPropertyValueFromTxt(text, 'VIDEOGAP', true),
        realBpm: getPropertyValueFromTxt(text, 'REALBPM', true),
        previewStart: getPropertyValueFromTxt(text, 'PREVIEWSTART', true),
        previewEnd: getPropertyValueFromTxt(text, 'PREVIEWEND', true),
        volume: getPropertyValueFromTxt(text, 'VOLUME', true),
        author: getPropertyValueFromTxt(text, 'CREATOR') ?? author,
        authorUrl: getPropertyValueFromTxt(text, 'CREATORURL') ?? authorUrl,
        sourceUrl: getPropertyValueFromTxt(text, 'SOURCEURL') ?? sourceUrl,
        // todo upgrade eslint and use `satisfies` instead of `as`
    } as Omit<Song, 'tracks' | 'artist' | 'title' | 'bar' | 'bpm' | 'gap' | 'video'>;
    // as ExtractOptional<Song>;

    if (additionalData.videoGap) additionalData.videoGap = Math.floor(additionalData.videoGap);

    const song: Song = {
        title: getPropertyValueFromTxt(text, 'TITLE') ?? '',
        artist: getPropertyValueFromTxt(text, 'ARTIST') ?? '',
        bpm: Number(getPropertyValueFromTxt(text, 'BPM')?.replace(',', '.') ?? 0),
        bar: 4,
        gap: Number(getPropertyValueFromTxt(text, 'GAP')?.replace(',', '.') ?? 0),
        video: getPropertyValueFromTxt(text, 'VIDEOID') ?? '',
        ...additionalData,
        tracks: [],
    };

    if (song.video === '' && videoLink) {
        try {
            const linkUrl = new URL(videoLink);
            song.video = linkUrl.searchParams.get('v') || 'Invalid link';
        } catch (e: any) {
            song.video = `Invalid link: ${e.message}`;
        }
    }

    let sections: Section[] = [];
    let lastStart = 0;

    text.split('\n').forEach((line) => {
        if (line.startsWith('#')) return;
        const split = line.split(' ');

        if (Number(split[1]) < lastStart && sections.length) {
            // new track (song is a duet)
            if (trackNames[song.tracks.length]) song.tracks.push({ sections, name: trackNames[song.tracks.length] });
            else song.tracks.push({ sections });
            sections = [];
        }

        if (LINE_BREAK_RELATIVE_REGEXP.test(line)) {
            // "Pause" or relative line break
            const [, start, end] = split;
            sections.push({ start: Number(start), end: Number(end), type: 'pause' });
            sections.push({ start: Number(end), type: 'notes', notes: [] });

            lastStart = Number(end);
        } else if (line.startsWith('-')) {
            // new section
            sections.push({ start: Number(line.split('-')[1].trim()), notes: [], type: 'notes' });
        } else if (Object.keys(typesMap).includes(line[0])) {
            if (sections.length === 0) {
                sections = [{ start: 0, notes: [], type: 'notes' }];
            }
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

    if (trackNames[song.tracks.length]) song.tracks.push({ sections, name: trackNames[song.tracks.length] });
    else song.tracks.push({ sections });

    song.tracks = song.tracks.map((track) => ({
        ...track,
        // get rid of sections with no notes
        sections: track.sections.filter((section) => section.type === 'pause' || section.notes.length),
    }));

    return song;
}
