import { ExtractOptional, NotesSection, Section, Song } from 'interfaces';
import { ValuesType } from 'utility-types';
import notFalsy from '../../utils/notFalsy';
import { generatePlayerChangesForTrack } from './generatePlayerChanges';
import getSongId from './getSongId';
import mergeTracks from './mergeTracks';

export const typesMap = {
  R: 'rap',
  F: 'freestyle',
  '*': 'star',
  ':': 'normal',
  G: 'rapstar',
} as const;

export const txtTypesMap: Record<ValuesType<typeof typesMap>, keyof typeof typesMap> = {
  rap: 'R',
  freestyle: 'F',
  star: '*',
  normal: ':',
  rapstar: 'G',
};

export const songTXTKeys = [
  'TRACKNAMES',
  'YEAR',
  'EDITION',
  'GENRE',
  'LANGUAGE',
  'VIDEOGAP',
  'PREVIEWSTART',
  'CREATOR',
  'TITLE',
  'ARTIST',
  'BPM',
  'GAP',
  'ID',
  'LASTUPDATE',
  'VOLUME',
  'REALBPM',
  'PREVIEWEND',
  'CREATORURL',
  'SOURCEURL',
  'ARTISTORIGIN',
  'VIDEOID',
  'ALLKARAOKE_ID',
  'ALLKARAOKE_LASTUPDATE',
  'ALLKARAOKE_VOLUME',
  'ALLKARAOKE_REALBPM',
  'ALLKARAOKE_PREVIEWEND',
  'ALLKARAOKE_CREATORURL',
  'ALLKARAOKE_SOURCEURL',
  'ALLKARAOKE_ARTISTORIGIN',
  'ALLKARAOKE_VIDEOID',
] as const;

export type knownSongTxtKeys = ValuesType<typeof songTXTKeys> | 'VIDEO' | 'P1' | 'P2';

function getUnknownProps(txt: string) {
  return txt
    .split('\n')
    .filter(
      (line) => line.startsWith('#') && !(songTXTKeys as unknown as string[]).includes(line.substring(1).split(':')[0]),
    );
}

function getPropertyValueFromTxt(txt: string, keys: knownSongTxtKeys[], type?: 'string'): string | undefined;
function getPropertyValueFromTxt(txt: string, keys: knownSongTxtKeys[], type?: 'array'): string[] | undefined;
function getPropertyValueFromTxt(txt: string, keys: knownSongTxtKeys[], type?: 'number'): number | undefined;
function getPropertyValueFromTxt(
  txt: string,
  keys: knownSongTxtKeys[],
  type: 'string' | 'number' | 'array' = 'string',
) {
  const getValue = (key: knownSongTxtKeys) => {
    const regex = new RegExp(`#${key}\\:(.*)`);

    const value = txt.match(regex)?.[1];
    if (value === undefined) return undefined;
    if (type === 'number') {
      return Number(value.replace(',', '.')) ?? 0;
    } else if (type === 'array') {
      const vals = value.split(', ');

      return vals;
    }
    return value;
  };

  return keys.map(getValue).filter(notFalsy).at(0);
}

function getEmbeddedYoutubeVideoId(txt: string) {
  const value = getPropertyValueFromTxt(txt, ['VIDEO']) ?? '';
  const regex = new RegExp(`v=(.*?)(,|$)`);
  return value.match(regex)?.[1];
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

function getTrackNames(txt: string) {
  const p1 = getPropertyValueFromTxt(txt, ['P1']);
  const p2 = getPropertyValueFromTxt(txt, ['P2']);
  if (p1 || p2) return [p1, p2];
  const trackNames: string[] = safeJsonParse<string[]>(getPropertyValueFromTxt(txt, ['TRACKNAMES']), []);

  return trackNames;
}

export default function convertTxtToSong(
  text: string,
  videoLink?: string,
  author?: string,
  authorUrl?: string,
  sourceUrl?: string,
): Song {
  const trackNames = getTrackNames(text);

  const additionalData = {
    year: getPropertyValueFromTxt(text, ['YEAR']),
    artistOrigin: getPropertyValueFromTxt(text, ['ALLKARAOKE_ARTISTORIGIN', 'ARTISTORIGIN']),
    lastUpdate: getPropertyValueFromTxt(text, ['ALLKARAOKE_LASTUPDATE', 'LASTUPDATE']),
    edition: getPropertyValueFromTxt(text, ['EDITION']),
    genre: getPropertyValueFromTxt(text, ['GENRE']),
    videoGap: getPropertyValueFromTxt(text, ['VIDEOGAP'], 'number'),
    realBpm: getPropertyValueFromTxt(text, ['ALLKARAOKE_REALBPM', 'REALBPM'], 'number'),
    previewStart: getPropertyValueFromTxt(text, ['PREVIEWSTART'], 'number'),
    previewEnd: getPropertyValueFromTxt(text, ['ALLKARAOKE_PREVIEWEND', 'PREVIEWEND'], 'number'),
    volume: getPropertyValueFromTxt(text, ['ALLKARAOKE_VOLUME', 'VOLUME'], 'number'),
    author: getPropertyValueFromTxt(text, ['CREATOR']) ?? author,
    authorUrl: getPropertyValueFromTxt(text, ['ALLKARAOKE_CREATORURL', 'CREATORURL']) ?? authorUrl,
    sourceUrl: getPropertyValueFromTxt(text, ['ALLKARAOKE_SOURCEURL', 'SOURCEURL']) ?? sourceUrl,
  } satisfies ExtractOptional<Song>;

  if (additionalData.videoGap) additionalData.videoGap = Math.floor(additionalData.videoGap);
  const title = getPropertyValueFromTxt(text, ['TITLE']) ?? '';
  const artist = getPropertyValueFromTxt(text, ['ARTIST']) ?? '';
  const video =
    getPropertyValueFromTxt(text, ['ALLKARAOKE_VIDEOID', 'VIDEOID']) ?? getEmbeddedYoutubeVideoId(text) ?? '';

  const song: Song = {
    id: getPropertyValueFromTxt(text, ['ALLKARAOKE_ID', 'ID']) ?? getSongId({ title, artist }),
    title,
    artist,
    video,
    language: getPropertyValueFromTxt(text, ['LANGUAGE'], 'array') ?? [],
    bpm: Number(getPropertyValueFromTxt(text, ['BPM'])?.replace(',', '.') ?? 0),
    bar: 4,
    gap: Number(getPropertyValueFromTxt(text, ['GAP'])?.replace(',', '.') ?? 0),
    ...additionalData,
    tracks: [],
    unsupportedProps: getUnknownProps(text),
    mergedTrack: {} as any,
  };

  // Either ID is entered or try to parse link
  if (videoLink?.length === 11) {
    song.video = videoLink;
  } else if (videoLink) {
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
      if (trackNames[song.tracks.length])
        song.tracks.push({ sections, name: trackNames[song.tracks.length], changes: [] });
      else song.tracks.push({ sections, changes: [] });
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
        type: typesMap[type as keyof typeof typesMap] ?? 'normal',
        start: Number(start),
        length: Number(length),
        pitch: Number(pitch),
        lyrics: lyrics.join(' '),
      });
      lastStart = Number(split[1]);
    }
  });

  if (trackNames[song.tracks.length]) song.tracks.push({ sections, name: trackNames[song.tracks.length], changes: [] });
  else song.tracks.push({ sections, changes: [] });

  song.tracks = song.tracks
    .map((track) => ({
      ...track,
      // get rid of sections with no notes
      sections: track.sections.filter((section) => section.type === 'pause' || section.notes.length),
      changes: [],
    }))
    .map((track) => ({
      ...track,
      changes: generatePlayerChangesForTrack(track, song),
    }));

  song.mergedTrack = mergeTracks(song.tracks, song);

  return song;
}
