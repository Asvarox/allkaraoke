import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

import type { Song } from '~/interfaces';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';
import { createYoutubeDurationProbeClient } from './youtubeDurationClient';

const SONGS_FOLDER = './public/songs';
const DEFAULT_TIMEOUT_MS = 8000;

function getCliArgument(name: string): string | undefined {
  const argumentIndex = process.argv.findIndex((argument) => argument === `--${name}`);
  if (argumentIndex >= 0) {
    return process.argv[argumentIndex + 1];
  }

  const prefixedArgument = process.argv.find((argument) => argument.startsWith(`--${name}=`));
  if (prefixedArgument) {
    return prefixedArgument.split('=')[1];
  }

  return undefined;
}

async function main() {
  const timeoutArgument = getCliArgument('timeout-ms');
  const timeoutMs = timeoutArgument ? Number(timeoutArgument) : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Invalid --timeout-ms value. Expected a positive number.');
  }

  const songFiles = readdirSync(SONGS_FOLDER)
    .filter((fileName) => fileName.endsWith('.txt'))
    .sort((firstFileName, secondFileName) => firstFileName.localeCompare(secondFileName));

  const durationProbeClient = await createYoutubeDurationProbeClient(timeoutMs);

  let updatedSongs = 0;
  let skippedSongs = 0;
  let failedSongs = 0;

  try {
    for (const fileName of songFiles) {
      const fullPath = `${SONGS_FOLDER}/${fileName}`;
      const songText = readFileSync(fullPath, { encoding: 'utf-8' });
      const song: Song = convertTxtToSong(songText);

      if (!song.video) {
        skippedSongs += 1;
        continue;
      }

      if (song.duration !== undefined) {
        skippedSongs += 1;
        continue;
      }

      console.log(`Backfilling duration: ${song.artist} - ${song.title} (${fileName})`);

      try {
        const durationSeconds = await durationProbeClient.getDuration(song.video);
        const updatedSong: Song = {
          ...song,
          duration: durationSeconds,
        };

        const updatedSongText = convertSongToTxt(updatedSong);
        writeFileSync(fullPath, updatedSongText, { encoding: 'utf-8' });

        updatedSongs += 1;
      } catch (error) {
        failedSongs += 1;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Skipping duration for ${fileName}: ${errorMessage}`);
      }
    }
  } finally {
    await durationProbeClient.close();
  }

  console.log(
    JSON.stringify(
      {
        totalSongs: songFiles.length,
        updatedSongs,
        skippedSongs,
        failedSongs,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exitCode = 1;
});
