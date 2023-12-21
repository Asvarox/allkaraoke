import { ExtractOptional, NotesSection, Section, Song } from 'interfaces';
import { ValuesType } from 'utility-types';
import getSongId from './getSongId';

export const typesMap = {
  R: 'rap',
  F: 'freestyle',
  '*': 'star',
  ':': 'normal',
} as const;

export const txtTypesMap: Record<ValuesType<typeof typesMap>, keyof typeof typesMap> = {
  rap: 'R',
  freestyle: 'F',
  star: '*',
  normal: ':',
};

export type SongTXTKeys =
  | 'ID'
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
  | 'ARTISTORIGIN'
  | 'BPM'
  | 'GAP'
  | 'VIDEOID'
  | 'VIDEO'; // #VIDEO is used on https://usdb.animux.de

function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, type?: 'string'): string | undefined;
function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, type?: 'array'): string[] | undefined;
function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, type?: 'number'): number | undefined;
function getPropertyValueFromTxt(txt: string, key: SongTXTKeys, type: 'string' | 'number' | 'array' = 'string') {
  const regex = new RegExp(`#${key}\\:(.*)`);

  const value = txt.match(regex)?.[1];
  if (value === undefined) return undefined;
  if (type === 'number') {
    return Number(value.replace(',', '.')) ?? 0;
  } else if (type === 'array') {
    const vals = value.split(', ');

    return vals.length > 1 ? vals : value;
  }
  return value;
}

function getEmbeddedYoutubeVideoId(txt: string) {
  const regex = new RegExp(`#VIDEO\\:v=(.*?),`);
  return txt.match(regex)?.[1];
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
    artistOrigin: getPropertyValueFromTxt(text, 'ARTISTORIGIN'),
    lastUpdate: getPropertyValueFromTxt(text, 'LASTUPDATE'),
    edition: getPropertyValueFromTxt(text, 'EDITION'),
    genre: getPropertyValueFromTxt(text, 'GENRE'),
    videoGap: getPropertyValueFromTxt(text, 'VIDEOGAP', 'number'),
    realBpm: getPropertyValueFromTxt(text, 'REALBPM', 'number'),
    previewStart: getPropertyValueFromTxt(text, 'PREVIEWSTART', 'number'),
    previewEnd: getPropertyValueFromTxt(text, 'PREVIEWEND', 'number'),
    volume: getPropertyValueFromTxt(text, 'VOLUME', 'number'),
    author: getPropertyValueFromTxt(text, 'CREATOR') ?? author,
    authorUrl: getPropertyValueFromTxt(text, 'CREATORURL') ?? authorUrl,
    sourceUrl: getPropertyValueFromTxt(text, 'SOURCEURL') ?? sourceUrl,
    // todo upgrade eslint and use `satisfies` instead of `as`
  } as ExtractOptional<Song>;

  if (additionalData.videoGap) additionalData.videoGap = Math.floor(additionalData.videoGap);
  const title = getPropertyValueFromTxt(text, 'TITLE') ?? '';
  const artist = getPropertyValueFromTxt(text, 'ARTIST') ?? '';
  const video = getPropertyValueFromTxt(text, 'VIDEOID') ?? getEmbeddedYoutubeVideoId(text) ?? '';

  const song: Song = {
    id: getPropertyValueFromTxt(text, 'ID') ?? getSongId({ title, artist }),
    title,
    artist,
    video,
    language: getPropertyValueFromTxt(text, 'LANGUAGE', 'array') ?? [],
    bpm: Number(getPropertyValueFromTxt(text, 'BPM')?.replace(',', '.') ?? 0),
    bar: 4,
    gap: Number(getPropertyValueFromTxt(text, 'GAP')?.replace(',', '.') ?? 0),
    ...additionalData,
    tracks: [],
  };

  // Either ID is entered or try to parse link
  if (videoLink?.length === 11) {
    song.video = videoLink;
  } else if (song.video === '' && videoLink) {
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

    // Sometimes the txts are wrongly formatted and include breaks/notes that just overlap
    // The assumption here is that tracks should start and end roughly similarly, so if a next
    // track starts just as the previous ends, it's considered a wrong formatting issue rather
    // than a new track
    if (Number(split[1]) < lastStart * 0.75 && sections.length) {
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
