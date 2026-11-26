import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

import type { Song } from '~/interfaces';

import convertSongToTxt from '../src/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '../src/modules/songs/utils/convert-txt-to-song';
import { createYoutubeDurationProbeClient } from './youtube-duration-client';

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

      const needsInstrumental = !!song.instrumental && song.instrumental.duration === undefined;
      if (song.duration !== undefined && !needsInstrumental) {
        skippedSongs += 1;
        continue;
      }

      console.log(`Backfilling duration: ${song.artist} - ${song.title} (${fileName})`);

      // Probed one by one, so a video that can't be reached doesn't throw away the other's duration
      const probe = async (video: string, label: string) => {
        try {
          return await durationProbeClient.getDuration(video);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Skipping ${label} duration for ${fileName}: ${errorMessage}`);
          return undefined;
        }
      };
      const duration = song.duration ?? (await probe(song.video, 'original'));
      const instrumentalDuration =
        song.instrumental && needsInstrumental ? await probe(song.instrumental.video, 'instrumental') : undefined;
      const failed = duration === undefined || (needsInstrumental && instrumentalDuration === undefined);
      if (failed) failedSongs += 1;
      if (duration === song.duration && instrumentalDuration === undefined) continue;

      const updatedSong: Song = {
        ...song,
        duration,
        instrumental:
          song.instrumental && instrumentalDuration !== undefined
            ? { ...song.instrumental, duration: instrumentalDuration }
            : song.instrumental,
      };
      writeFileSync(fullPath, convertSongToTxt(updatedSong), { encoding: 'utf-8' });
      if (!failed) updatedSongs += 1;
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
