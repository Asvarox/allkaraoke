import posthog from 'posthog-js';

import { SingSetup, Song, SongPreview } from '~/interfaces';
import events from '~/modules/game-events/game-events';
import OnlineClient from '~/modules/online/client/online-client';
import PlayersManager from '~/modules/players/players-manager';
import { InputSourceNames } from '~/routes/select-input/input-sources/interfaces';
import { MobilePhoneModeSetting } from '~/routes/settings/settings-state';

const trackSongData =
  (event: keyof typeof events) =>
  (
    { artist, title, id, lastUpdate }: Song | SongPreview,
    setup: SingSetup,
    scores: Array<{ name: string; score: number }> = [],
    progress?: number,
  ) => {
    // Online mode tracks its own songStarted/songEnded once the room actually starts/finishes
    // singing (host-only, room-wide player count and scores) — see online-analytics.ts. This
    // dispatch fires too early for online (at song pick, with just the solo local player), so
    // skip the local-shaped capture here rather than double-report the event.
    if (OnlineClient.getRoomCode()) return;

    const sameScores = scores.length > 1 && scores.every((score) => score.score === scores[0].score);

    const inputs: Record<string, InputSourceNames> = {};
    PlayersManager.getPlayers().forEach((player, index) => {
      if (!player.input) {
        return;
      }

      inputs[`input${index}`] = player.input.source;
    });

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
