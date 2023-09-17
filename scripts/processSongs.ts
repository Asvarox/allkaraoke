import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { MusicBrainzApi } from 'musicbrainz-api';
import { IIsrcSearchResult } from 'musicbrainz-api/lib/musicbrainz.types';
import { Song } from '../src/interfaces';
import { fixDiacritics } from '../src/Scenes/Convert/Steps/utils/fixDiacritics';
import convertSongToTxt from '../src/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';
import clearString from '../src/utils/clearString';
// @ts-ignore
import scrapedBpmData from './scraped-bpm-data.json';

const mbApi = new MusicBrainzApi({
  appName: 'Olkaraoke',
  appVersion: '0.1.0',
  appContactInfo: 'tatarczyk.aleksander@gmail.com',
});

const SONGS_FOLDER = './public/songs';

(async function () {
  const songs = readdirSync(SONGS_FOLDER);

  for (const file of songs) {
    if (!file.endsWith('.txt')) continue;
    console.log('reading', file);

    let song: Song = convertTxtToSong(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    console.log(`"${song.artist}" "${song.title}"`);
    const { tracks, ...songData } = song;
    try {
      // await fillMissingRealBpm(songData, file);
      // await fillSongYear(songData);
    } catch (e) {
      console.error(e);
    }
    const finalSong = { ...songData, tracks };
    // finalSong.id = getSongId(finalSong);

    const fixedTxt = await fixAccentCharacters(
      convertSongToTxt(finalSong),
      Array.isArray(song.language) ? song.language[0] : song.language,
    );

    writeFileSync(`${SONGS_FOLDER}/${finalSong.id}.txt`, fixedTxt, {
      encoding: 'utf-8',
    });
  }
})();

async function fixAccentCharacters(txt: string, language: string) {
  return fixDiacritics(txt, language.toLowerCase());
}

async function fillMissingRealBpm(songData: Omit<Song, 'tracks'>, file: string) {
  if (songData.realBpm) {
    return;
  }
  console.log('    Missing real BPM');

  const songBpmData = scrapedBpmData[file as keyof typeof scrapedBpmData];

  if (songBpmData) {
    console.log('    Found scraped BPM', songBpmData.tempo);
    songData.realBpm = +songBpmData.tempo!;
  } else {
    songData.realBpm = 0;
  }
}

async function fillSongYear(songData: Omit<Song, 'tracks'>) {
  if (songData.year && songData.year !== '') {
    return;
  }
  console.log('    Missing year');

  const externalData = await mbApi.search<IIsrcSearchResult>('recording', {
    query: `"${songData.artist}" "${songData.title}"`,
  });

  if (externalData.count > 0) {
    let oldestRecord = externalData.recordings[0];

    externalData.recordings.forEach((result) => {
      // @ts-expect-error
      const firstReleaseDate = result['first-release-date']?.split('-')?.[0] ?? -Infinity;
      // @ts-expect-error
      const currentOldestRelease = oldestRecord['first-release-date']?.split('-')?.[0] ?? Infinity;
      if (clearString(result.title) === clearString(songData.title) && currentOldestRelease > firstReleaseDate) {
        oldestRecord = result;
      }
    });

    // @ts-expect-error
    const currentOldestRelease = oldestRecord['first-release-date']?.split('-')?.[0];
    if (
      clearString(oldestRecord.title) === clearString(songData.title) &&
      currentOldestRelease !== undefined &&
      currentOldestRelease > 100
    ) {
      console.log('    ...', currentOldestRelease);
      songData.year = currentOldestRelease;
    } else {
      console.log(
        '    ...not found',
        currentOldestRelease,
        clearString(oldestRecord.title),
        clearString(songData.title),
      );
    }
  }
}
