import { Song } from '~/interfaces';

import convertTxtToSong from './convert-txt-to-song';

function hasOnlyFiniteSectionValues(song: Song) {
  return song.tracks.every((track) =>
    track.sections.every((section) => {
      if (!Number.isFinite(section.start)) {
        return false;
      }

      if (section.type === 'pause') {
        return Number.isFinite(section.end);
      }

      return section.notes.every(
        (note) => Number.isFinite(note.start) && Number.isFinite(note.length) && Number.isFinite(note.pitch),
      );
    }),
  );
}

export default function isValidUltrastarTxtFormat(songTxt: string) {
  const lines = songTxt.split('\n');
  const requiredTags = ['#TITLE', '#ARTIST', '#BPM'];

  for (const tag of requiredTags) {
    if (!lines.some((line) => line.startsWith(tag))) {
      return false;
    }
  }

  // Any note type counts - normal (:), golden (*), freestyle (F), rap (R), golden rap (G)
  if (!lines.some((line) => /^[:*FRG] /.test(line))) {
    return false;
  }

  try {
    const song = convertTxtToSong(songTxt);
    const hasNotes = song.tracks.some((track) =>
      track.sections.some((section) => section.type === 'notes' && section.notes.length > 0),
    );
    return hasNotes && hasOnlyFiniteSectionValues(song);
  } catch (e) {
    console.log(e);
    return false;
  }
}
