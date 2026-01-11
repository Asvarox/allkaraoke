import { captureException } from '@sentry/react';
import { pack } from 'msgpackr';
import posthog from 'posthog-js';
import { SingSetup, Song, SongPreview } from '~/interfaces';
import GameState from '~/modules/GameEngine/GameState/GameState';
import getPlayerNoteDistance from '~/modules/GameEngine/Helpers/getPlayerNoteDistance';
import events from '~/modules/GameEvents/GameEvents';
import PlayersManager from '~/modules/Players/PlayersManager';
import { InputSourceNames } from '~/routes/SelectInput/InputSources/interfaces';
import { MobilePhoneModeSetting } from '~/routes/Settings/SettingsState';

const trackSongData =
  (event: keyof typeof events) =>
  (
    { artist, title, id, lastUpdate }: Song | SongPreview,
    setup: SingSetup,
    scores: Array<{ name: string; score: number }> = [],
    progress?: number,
  ) => {
    const sameScores = scores.length > 1 && scores.every((score) => score.score === scores[0].score);

    const inputs: Record<string, InputSourceNames> = {};
    PlayersManager.getPlayers().forEach((player, index) => (inputs[`input${index}`] = player.input.source));

    if (event === 'songEnded') {
      try {
        // compress frequency records and see how much space they take, to analyze data usage
        // for potential global leaderboard. The data can be used to verify if the score is legit
        // there might be some losses in precision but for the purpose of verifying the score it should be enough
        const freqs = GameState.getPlayer(0)
          ?.getPlayerNotes()
          .filter((note) => getPlayerNoteDistance(note) === 0)
          .map((note) => note.frequencyRecords)
          .flat()
          .map((record) => [record.timestamp, record.frequency])
          // calculate deltas between subsequent records (each record value is a delta from the previous one)
          .map((record, index, array) => [
            record[0] - (array[index - 1]?.[0] ?? 0),
            record[1] - (array[index - 1]?.[1] ?? 0),
          ])
          // Reduce precision to 2 and multiply by 100 to get integers
          .map((record) => [Math.round(record[0] * 100), Math.round(record[1] * 100)])
          // If the delta is 0, we can just store timestamp instead of the array
          .map((record) => (record[1] === 0 ? record[0] : record));

        const compressed = pack(freqs);
        console.log('compressed', compressed);
      } catch (e) {
        captureException(e);
      }
    }

    posthog.capture(event, {
      songId: id,
      songLastUpdated: lastUpdate,
      name: `${artist} - ${title}`,
      artist,
      title,
      mode: setup.mode,
      tolerance: setup.tolerance,
      players: setup.players.length,
      tracks: setup.players.map((player) => player.track),
      progress: progress ?? null,
      singId: setup.id,
      sameScores,
      mobilePhoneMode: !!MobilePhoneModeSetting.get(),
      ...inputs,
      ...scores.reduce((curr, score, index) => ({ ...curr, [`score${index}`]: score.score }), {}),
      ...setup.players.reduce((curr, score, index) => ({ ...curr, [`track${index}`]: score.track }), {}),
    });
  };

events.songStarted.subscribe(trackSongData('songStarted'));
events.songEnded.subscribe(trackSongData('songEnded'));
