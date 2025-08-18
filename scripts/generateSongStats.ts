import { uniq } from 'es-toolkit';
import { writeFileSync } from 'fs';
import { SongPreview } from 'interfaces';

const songStats = {
  artists: [] as string[],
  languages: [] as string[],
  songs: 0,
};

const index: SongPreview[] = require('../public/songs/index.json');

// Sort languages alphabetically
songStats.languages = uniq(index.map((song) => song.language).flat()).sort();

// Sort artists by number of songs (descending)
const englishSongs = index.filter((song) => song.language[0] === 'English');
const artistSongCounts = new Map<string, number>();

// Count songs per artist
englishSongs.forEach((song) => {
  const artist = song.artist;
  if (artist.length < 30) {
    artistSongCounts.set(artist, (artistSongCounts.get(artist) || 0) + 1);
  }
});

// Sort artists by song count (descending) and get unique artists
songStats.artists = Array.from(artistSongCounts.entries())
  .sort(([, countA], [, countB]) => countB - countA)
  .slice(0, 150)
  .map(([artist]) => artist);

songStats.songs = index.length;

writeFileSync('./src/routes/LandingPage/songStats.json', JSON.stringify(songStats, undefined, 2));
