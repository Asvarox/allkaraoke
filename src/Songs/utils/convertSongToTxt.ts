import { Note, Song } from 'interfaces';
import { invert } from 'lodash-es';
import isNotesSection from 'Songs/utils/isNotesSection';
import { ValuesType } from 'utility-types';
import { SongTXTKeys, typesMap } from 'Songs/utils/convertTxtToSong';

export const txtTypesMap = invert(typesMap) as any as Record<ValuesType<typeof typesMap>, keyof typeof typesMap>;

function toTxtValue(key: SongTXTKeys, value: string | string[] | number | undefined) {
    if (value === undefined) return undefined;
    return `#${key}:${
        typeof value === 'number'
            ? value.toString(10).replace('.', ',')
            : Array.isArray(value)
            ? value.join(', ')
            : value
    }`;
}

const notesToText = (notes: Note[]) =>
    notes
        .map((note) => `${txtTypesMap[note.type]} ${note.start} ${note.length} ${note.pitch} ${note.lyrics}`)
        .join('\n');

export default function convertSongToTxt(song: Song) {
    const parsedValues: Record<keyof Omit<Song, 'tracks' | 'bar'>, string | undefined> = {
        artist: toTxtValue('ARTIST', song.artist),
        title: toTxtValue('TITLE', song.title),
        author: toTxtValue('CREATOR', song.author),
        authorUrl: toTxtValue('CREATORURL', song.authorUrl),
        bpm: toTxtValue('BPM', song.bpm),
        realBpm: toTxtValue('REALBPM', song.realBpm),
        year: toTxtValue('YEAR', song.year),
        sourceUrl: toTxtValue('SOURCEURL', song.sourceUrl),
        previewStart: toTxtValue('PREVIEWSTART', song.previewStart),
        previewEnd: toTxtValue('PREVIEWEND', song.previewEnd),
        video: toTxtValue('VIDEOID', song.video),
        videoGap: toTxtValue('VIDEOGAP', song.videoGap),
        volume: toTxtValue('VOLUME', song.volume),
        genre: toTxtValue('GENRE', song.genre),
        language: toTxtValue('LANGUAGE', song.language),
        lastUpdate: toTxtValue('LASTUPDATE', song.lastUpdate),
        edition: toTxtValue('EDITION', song.edition),
        gap: toTxtValue('GAP', song.gap),
    };
    const trackNames = song.tracks.map((track) => track.name ?? null);

    const lines: string[] = [];
    song.tracks
        .map((track) => track.sections)
        .forEach(([first, ...sections]) => {
            lines.push(isNotesSection(first) ? notesToText(first.notes) : `- ${first.start} ${first.end}`);

            sections.forEach((section) =>
                lines.push(
                    isNotesSection(section)
                        ? `- ${section.start}\n${notesToText(section.notes)}`
                        : `- ${section.start} ${section.end}`,
                ),
            );
        });

    return Object.values(parsedValues)
        .concat(trackNames.filter(Boolean).length ? toTxtValue('TRACKNAMES', JSON.stringify(trackNames)) : [])
        .concat(lines)
        .concat('E')
        .filter((value) => value !== undefined)
        .join('\n');
}
