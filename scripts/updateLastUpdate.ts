import { readFileSync, writeFileSync } from 'fs';
import { Song } from 'interfaces';
import { IArtistList, MusicBrainzApi } from 'musicbrainz-api';
import * as process from 'process';
import songIndex from '../public/songs/index.json';
import convertSongToTxt from '../src/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';

const files = process.argv.slice(2);
console.log(files);

(async () => {
  for (const file of files) {
    if (!file.endsWith('.txt')) continue;

    const contents = readFileSync(file, 'utf-8');
    const data = convertTxtToSong(contents);

    await updateLastUpdate(data);
    await updateArtistOrigin(data);

    writeFileSync(file, convertSongToTxt(data), 'utf-8');
  }
})();

async function updateLastUpdate(song: Song) {
  const updateDate = new Date().toISOString();
  song.lastUpdate = updateDate;
}

const mbApi = new MusicBrainzApi({
  appName: 'Olkaraoke',
  appVersion: '0.1.0',
  appContactInfo: 'tatarczyk.aleksander@gmail.com',
});

const foundOrigins: Record<string, string> = {};
async function updateArtistOrigin(song: Song) {
  if (song.artistOrigin) return;
  const existingSong = songIndex.find((songFromIndex) => songFromIndex.artist === song.artist);
  if (foundOrigins[song.artist]) {
    song.artistOrigin = foundOrigins[song.artist];
  } else if (existingSong?.artistOrigin) {
    song.artistOrigin = existingSong.artistOrigin;
  } else {
    console.log(`Looking for ${song.artist} origin`);
    const externalData = await mbApi.search<IArtistList>('artist', {
      query: `"${song.artist}"`,
    });
    if (externalData.count > 0) {
      song.artistOrigin = externalData.artists[0].country;
      foundOrigins[song.artist] = song.artistOrigin!;
    }
  }
}
