import { ExtractOptional, NotesSection, Section, Song } from "../../interfaces";


const typesMap = {
    'R': 'rap',
    'F': 'freestyle',
    '*': 'star',
    ':': 'normal',
}

function getPropertyValueFromTxt(txt: string, key: string): string | undefined {
    const regex = new RegExp(`#${key}\\:(.*)`);

    return txt.match(regex)?.[1] ?? undefined;
}

const LINE_BREAK_RELATIVE_REGEXP = /\- \d+ \d+/;

export default function convertTxtToSong(text: string, videoLink: string, author: string, authorUrl: string, sourceUrl: string): Song {
    const additionalData: ExtractOptional<Song> = {
        year: getPropertyValueFromTxt(text, 'YEAR'),
        edition: getPropertyValueFromTxt(text, 'EDITION'),
        genre: getPropertyValueFromTxt(text, 'GENRE'),
        language: getPropertyValueFromTxt(text, 'LANGUAGE'),
        videoGap: Math.floor(Number(getPropertyValueFromTxt(text, 'VIDEOGAP')?.replace(',', '.') ?? 0)),
        author,
        authorUrl,
        sourceUrl,
    }
    const song: Song = {
        title: getPropertyValueFromTxt(text, 'TITLE') ?? '',
        artist: getPropertyValueFromTxt(text, 'ARTIST') ?? '',
        bpm: Number(getPropertyValueFromTxt(text, 'BPM')?.replace(',', '.') ?? 0),
        bar: 4,
        gap: Number(getPropertyValueFromTxt(text, 'GAP')?.replace(',', '.') ?? 0),
        video: '',
        ...additionalData,
        tracks: [],
    }

    if (author) song.author = author;
    if (authorUrl) song.authorUrl = authorUrl;
    if (sourceUrl) song.sourceUrl = sourceUrl;

    try {
        const linkUrl = new URL(videoLink);
        song.video = linkUrl.searchParams.get('v') || 'Invalid link'
    } catch (e: any) {
        song.video = `Invalid link: ${e.message}`;
    }

    const sections: Section[] = [{ start: 0, notes: [], type: 'notes' }];

    text.split("\n").forEach(line => {
        if (line.startsWith('#')) return;

        if (LINE_BREAK_RELATIVE_REGEXP.test(line)) {
            const [, start, end] = line.split(' ');
            sections.push({ start: Number(start), end: Number(end), type: 'pause' });
            sections.push({ start: Number(end), type: 'notes', notes: [] });
        } else if (line.startsWith('-')) {
            sections.push({ start: Number(line.split('-')[1].trim()), notes: [], type: 'notes' });
        } else if (Object.keys(typesMap).includes(line[0])) {
            const lastSection = sections[sections.length - 1];

            const [type, start, length, pitch, ...lyrics] = line.split(' ');

            (lastSection as NotesSection).notes.push({
                type: typesMap[type as 'R' | '*' | ':'] ?? 'normal',
                start: Number(start),
                length: Number(length), 
                pitch: Number(pitch),
                lyrics: lyrics.join(' '),
            })
        }
    });

    song.tracks.push({ sections });

    return song;
}