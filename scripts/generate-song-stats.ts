import { writeFileSync } from 'fs';

import { uniq } from 'es-toolkit';

import { SongPreview } from '~/interfaces';

const targetFile = './src/routes/landing-page/song-stats.json';

/** How many of the newest songs the landing page's "recently added" rail rotates through. */
const RECENTLY_ADDED_COUNT = 48;
/**
 * How far back the per-day tally reaches. The landing page counts the last 30 days out of it at
 * runtime rather than reading a number baked in here: this file is only regenerated when songs
 * change, and a count frozen at generation time would keep claiming songs that have since aged out
 * of the window.
 */
const ADDITIONS_HISTORY_DAYS = 60;

const songStats = {
  artists: [] as string[],
  languages: [] as string[],
  songs: 0,
  /**
   * When this file was generated. The landing page visual test pins the browser clock to it, so the
   * relative labels ("added 2 days ago") don't shift with the calendar and break the baselines on a
   * day nothing changed.
   */
  generatedAt: new Date().toISOString(),
  /** Songs added per day over the last {@link ADDITIONS_HISTORY_DAYS} days, keyed `YYYY-MM-DD`. */
  additionsPerDay: {} as Record<string, number>,
  /** The {@link RECENTLY_ADDED_COUNT} newest songs, newest first. `video` is the YouTube id the cover comes from. */
  recentlyAdded: [] as Array<{ artist: string; title: string; video: string; addedAt: string }>,
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

// Newest first by `shortId`, which is handed out in order as songs are added — unlike `lastUpdate`,
// which moves every time an old song is fixed up and would put it back at the top of the list.
const songsByAddition = index
  .filter((song): song is SongPreview & { lastUpdate: string } => !!song.lastUpdate)
  .sort((songA, songB) => songB.shortId - songA.shortId);

// There is no add date on a song, only `lastUpdate`. But a song was added no later than any song
// added after it was last touched, so the running minimum of `lastUpdate` walking down from the
// newest `shortId` is a date each song was already in the catalogue by: exact for a song nobody has
// edited since, and for an old song edited last week, the far older date of the songs that came
// after it — which keeps it out of the recent tally where its own `lastUpdate` would have put it in.
// ISO timestamps, so a string compare is a date compare.
let addedBy = '9999';
const additions = songsByAddition.map((song) => {
  addedBy = song.lastUpdate < addedBy ? song.lastUpdate : addedBy;
  return { song, addedAt: addedBy };
});

songStats.recentlyAdded = additions
  .slice(0, RECENTLY_ADDED_COUNT)
  .map(({ song: { artist, title, video }, addedAt }) => ({ artist, title, video, addedAt }));

const historyStart = Date.now() - ADDITIONS_HISTORY_DAYS * 24 * 60 * 60 * 1000;
additions.forEach(({ addedAt }) => {
  if (Date.parse(addedAt) >= historyStart) {
    const day = addedAt.slice(0, 10);
    songStats.additionsPerDay[day] = (songStats.additionsPerDay[day] ?? 0) + 1;
  }
});

writeFileSync(targetFile, JSON.stringify(songStats, undefined, 2));
