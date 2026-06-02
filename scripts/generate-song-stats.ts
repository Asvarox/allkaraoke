import { execSync } from 'child_process';
import { uniq } from 'es-toolkit';
import { existsSync, statSync, writeFileSync } from 'fs';
import { SongPreview } from '~/interfaces';

const targetFile = './src/routes/landing-page/song-stats.json';

// Skip running the script if the target file has been modified in the last 4 days
if (existsSync(targetFile)) {
  let lastModifiedTime = 0;

  try {
    const gitTimeStr = execSync(`git log -1 --format=%ct -- "${targetFile}"`, { encoding: 'utf-8' }).trim();
    if (gitTimeStr) {
      lastModifiedTime = parseInt(gitTimeStr, 10) * 1000;
    }
  } catch (error) {
    console.warn('Failed to get last commit time via git:', error);
  }

  // Fallback to fs.stat mtime if git failed or returned nothing
  if (!lastModifiedTime) {
    try {
      lastModifiedTime = statSync(targetFile).mtimeMs;
    } catch (error) {
      console.warn('Failed to get file mtime via stat:', error);
    }
  }

  if (lastModifiedTime) {
    const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
    const timeSinceLastChange = Date.now() - lastModifiedTime;
    if (timeSinceLastChange < fourDaysInMs) {
      console.log(
        `Skipping song stats generation: target file was modified ${(timeSinceLastChange / (24 * 60 * 60 * 1000)).toFixed(2)} days ago (limit is 4 days).`,
      );
      process.exit(0);
    }
  }
}

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

writeFileSync(targetFile, JSON.stringify(songStats, undefined, 2));
