import { SongPreview } from '~/interfaces';

const index: SongPreview[] = require('../public/songs/index.json');

/// group songs by artist property
const artistGroups: Record<string, SongPreview[]> = {};
index.forEach((song) => {
  if (!artistGroups[song.artist]) {
    artistGroups[song.artist] = [];
  }
  artistGroups[song.artist].push(song);
});

console.log(
  JSON.stringify(
    Object.values(artistGroups)
      .map((songs) => songs.length)
      .filter((length) => length > 3)
      .reduce((acc, length) => acc + length, 0),
    undefined,
    2,
  ),
);
