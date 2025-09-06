import { Note, Song } from 'interfaces';
import notFalsy from '../../utils/notFalsy';
import { knownSongTxtKeys, txtTypesMap } from './convertTxtToSong';
import isNotesSection from './isNotesSection';

function toTxtValue(key: knownSongTxtKeys, value: string | string[] | number | undefined) {
  if (value === undefined) return undefined;
  return `#${key}:${
    typeof value === 'number'
      ? value.toString(10).replace('.', ',')
      : Array.isArray(value)
        ? value.map((v) => v.trim()).join(', ')
        : value.trim()
  }`;
}

const notesToText = (notes: Note[]) =>
  notes.map((note) => `${txtTypesMap[note.type]} ${note.start} ${note.length} ${note.pitch} ${note.lyrics}`).join('\n');

const getMetadataKey = (meta: string) => meta.split(':')[0];

export default function convertSongToTxt(song: Song) {
  const parsedValues: Record<
    keyof Omit<Song, 'tracks' | 'bar' | 'unsupportedProps' | 'mergedTrack' | 'local' | 'isBuiltIn'>,
    string | undefined
  > = {
    artist: toTxtValue('ARTIST', song.artist),
    title: toTxtValue('TITLE', song.title),
    author: toTxtValue('CREATOR', song.author),
    bpm: toTxtValue('BPM', song.bpm),
    year: toTxtValue('YEAR', song.year),
    previewStart: toTxtValue('PREVIEWSTART', song.previewStart),
    video: toTxtValue('VIDEO', `v=${song.video}`),
    videoGap: toTxtValue('VIDEOGAP', song.videoGap),
    genre: toTxtValue('GENRE', song.genre),
    language: toTxtValue('LANGUAGE', song.language),
    gap: toTxtValue('GAP', song.gap),
    edition: toTxtValue('EDITION', song.edition),
    id: toTxtValue('ALLKARAOKE_ID', song.id),
    shortId: toTxtValue('ALLKARAOKE_SID', song.shortId),
    lastUpdate: toTxtValue('ALLKARAOKE_LASTUPDATE', song.lastUpdate),
    artistOrigin: toTxtValue('ALLKARAOKE_ARTISTORIGIN', song.artistOrigin),
    authorUrl: toTxtValue('ALLKARAOKE_CREATORURL', song.authorUrl),
    realBpm: toTxtValue('ALLKARAOKE_REALBPM', song.realBpm),
    sourceUrl: toTxtValue('ALLKARAOKE_SOURCEURL', song.sourceUrl),
    previewEnd: toTxtValue('ALLKARAOKE_PREVIEWEND', song.previewEnd),
    volume: toTxtValue('ALLKARAOKE_VOLUME', song.volume),
    manualVolume: toTxtValue('ALLKARAOKE_OLDVOLUME', song.manualVolume),
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

  const knownMetadata = Object.values(parsedValues)
    .concat(trackNames[0] ? toTxtValue('P1', trackNames[0]) : undefined)
    .concat(trackNames[1] ? toTxtValue('P2', trackNames[1]) : undefined)
    .filter(notFalsy);

  const knownMetadataKeys = knownMetadata.map(getMetadataKey);

  const unsupportedUniqueProps = (song.unsupportedProps ?? []).filter(
    (prop) => !knownMetadataKeys.includes(getMetadataKey(prop)),
  );

  return knownMetadata
    .concat(...unsupportedUniqueProps)
    .concat(lines)
    .concat('E')
    .filter(notFalsy)
    .join('\n');
}
