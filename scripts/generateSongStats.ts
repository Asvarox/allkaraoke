import { writeFileSync } from 'fs';
import { SongPreview } from 'interfaces';
import { shuffle, uniq } from 'lodash';

const songStats = {
  artists: [] as string[],
  languages: [] as string[],
  songs: 0,
};

const index: SongPreview[] = require('../public/songs/index.json');

songStats.languages = uniq(index.map((song) => song.language).flat());
// songStats.videoIds = uniq(
//   shuffle(index)
//     .slice(0, 200)
//     .map((song) => song.video),
// );
songStats.artists = shuffle(uniq(index.filter((song) => song.language[0] === 'English').map((song) => song.artist)));
songStats.songs = index.length;

writeFileSync('./src/routes/LandingPage/songStats.json', JSON.stringify(songStats, undefined, 2));
