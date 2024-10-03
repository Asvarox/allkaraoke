import { readFileSync, writeFileSync } from 'fs';
import { Song } from 'interfaces';
import { IArtistList, MusicBrainzApi } from 'musicbrainz-api';
import * as process from 'process';
import songIndex from '../public/songs/index.json';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';

const foundOrigins: Record<string, string> = {};
const files = process.argv.slice(2);
console.log(files);

(async () => {
  for (const file of files) {
    try {
      if (!file.endsWith('.txt')) continue;

      const contents = readFileSync(file, 'utf-8');
      const data = convertTxtToSong(contents);

      data.tracks.forEach((track) => {
        track.sections.forEach((section) => {
          if ('notes' in section) {
            section.notes.forEach((note) => {
              note.lyrics = note.lyrics.replaceAll(/\\+"/g, '"');
            });
          }
        });
      });

      try {
        await updateLastUpdate(data);
      } catch (error) {
        console.error(`Error updating last update for ${file}: ${error}`);
      }
      try {
        await updateArtistOrigin(data);
      } catch (error) {
        console.error(`Error updating artist origin for ${file}: ${error}`);
      }

      writeFileSync(file, convertSongToTxt(data), 'utf-8');
    } catch (error) {
      console.error(`Error processing ${file}: ${error}`);
    }
  }
})();

async function updateLastUpdate(song: Song) {
  const updateDate = new Date().toISOString();
  song.lastUpdate = updateDate;
}

const mbApi = new MusicBrainzApi({
  botAccount: {},
  appName: 'Olkaraoke',
  appVersion: '0.1.0',
  appContactInfo: 'tatarczyk.aleksander@gmail.com',
});

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
