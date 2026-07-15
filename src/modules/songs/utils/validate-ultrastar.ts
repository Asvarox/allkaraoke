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

  if (!lines.some((line) => line.startsWith(':'))) {
    return false;
  }

  try {
    const song = convertTxtToSong(songTxt);
    return hasOnlyFiniteSectionValues(song);
  } catch (e) {
    console.log(e);
    return false;
  }
}
