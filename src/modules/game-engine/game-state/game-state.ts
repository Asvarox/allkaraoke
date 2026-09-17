import { GAME_MODE, milliseconds, seconds, SingSetup, Song, songBeat } from '~/interfaces';
import {
  addDetailedScores,
  beatsToPoints,
  divideDetailedScores,
  emptyDetailedScore,
} from '~/modules/game-engine/game-state/helpers/calculate-score';
import {
  ScoreTimeline,
  calculateScoreTimeline,
  getTimelineRange,
} from '~/modules/game-engine/game-state/helpers/calculate-score-timeline';
import getCurrentBeat from '~/modules/game-engine/game-state/helpers/get-current-beat';
import PlayerState from '~/modules/game-engine/game-state/player-state';
import InputManager from '~/modules/game-engine/input/input-manager';
import { PlayerNumber } from '~/modules/players/player-number';
import getSongBeatCount from '~/modules/songs/utils/get-song-beat-count';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';
import tuple from '~/modules/utils/tuple';

export class GameStateClass {
  private song: Song | null = null;
  private currentTime: milliseconds = 0;
  private duration: seconds = 0;
  private singSetup: SingSetup | null = null;
  private playerStates: PlayerState[] = [];
  private playing: boolean = false;

  public setCurrentTime = (currentTime: milliseconds) => (this.currentTime = currentTime);
  public getCurrentTime = (accountGap = true): milliseconds => {
    return this.currentTime - (accountGap && this.song ? this.song.gap : 0);
  };

  public getSongBeatLength = (): milliseconds => getSongBeatLength(this.song!);
  public getCurrentBeat = (): songBeat => {
    return getCurrentBeat(this.getCurrentTime(), this.getSongBeatLength(), 0, false);
  };

  public setSong = (song: Song) => (this.song = song);
  public getSong = () => this.song;

  public getSingSetup = () => this.singSetup;
  public setSingSetup = (singSetup: SingSetup) => {
    this.singSetup = singSetup;

    this.playerStates = singSetup.players.map(({ number }) => new PlayerState(number, this));
    this.currentTime = 0;
    this.playing = true;
  };

  public resetSingSetup = () => {
    this.playing = false;
  };

  public isPlaying = () => this.playing;

  public getTolerance = () => this.getSingSetup()?.tolerance ?? 2;

  public setDuration = (duration: seconds) => (this.duration = duration);
  public getDuration = () => this.duration;

  public getPlayer = (playerNumber: PlayerNumber) =>
    this.playerStates.find((player) => player.getNumber() === playerNumber);

  public getPlayers = () => this.playerStates;

  public getPlayerCount = () => this.playerStates.length;

  public getPlayerScore = (player: PlayerNumber) => {
    if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
      const score = this.getPlayers().reduce((curr, playerState) => curr + playerState.getScore(), 0);

      return score / this.getPlayerCount();
    } else {
      return this.getPlayer(player)?.getScore() ?? -1;
    }
  };

  public getPlayerDetailedScore = (player: PlayerNumber) => {
    if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
      const scores = this.getPlayers().map((playerState) => playerState.getDetailedScore());

      // getDetailedScore returns beats - calculate actual points for each player
      const [fs, ...pointsScores] = scores.map(
        ([pointsPerBeat, counts, maxCounts]) =>
          [beatsToPoints(counts, pointsPerBeat), beatsToPoints(maxCounts, pointsPerBeat)] as const,
      );

      const summedPoints = pointsScores.reduce(
        (curr, pointsScore) => [addDetailedScores(curr[0], pointsScore[0]), addDetailedScores(curr[1], pointsScore[1])],
        fs,
      );
      return tuple([
        divideDetailedScores(summedPoints[0], this.getPlayerCount()),
        divideDetailedScores(summedPoints[1], this.getPlayerCount()),
      ]);
    } else {
      const [pointsPerBeat, counts, maxCounts] = this.getPlayer(player)!.getDetailedScore();

      return tuple([beatsToPoints(counts, pointsPerBeat), beatsToPoints(maxCounts, pointsPerBeat)]);
    }
  };

  /** Per-player running score for the results screen to animate through. Co-op collapses to the one
   * team score the same way `getPlayerDetailedScore` does: summed across players, then averaged. */
  public getPlayerScoreTimeline = (player: PlayerNumber): ScoreTimeline => {
    const song = this.getSong()!;
    // One range for everyone on the screen, so the same progress means the same moment of the song
    // in every timeline — see `getTimelineRange`.
    const range = getTimelineRange(
      song,
      this.getPlayers().map((playerState) => playerState.getPlayerNotes()),
    );
    const timelineOf = (playerState: PlayerState) =>
      calculateScoreTimeline(playerState.getPlayerNotes(), song, playerState.getTrackIndex(), range);

    if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
      const timelines = this.getPlayers().map(timelineOf);

      return timelines[0].map((_, sample) =>
        divideDetailedScores(
          timelines.reduce((sum, timeline) => addDetailedScores(sum, timeline[sample]), emptyDetailedScore()),
          this.getPlayerCount(),
        ),
      );
    }

    return timelineOf(this.getPlayer(player)!);
  };

  public getSongCompletionProgress = () => {
    console.log('getSongCompletionProgress', this.getCurrentBeat(), getSongBeatCount(this.getSong()!), this.getSong());
    return Math.max(0, Math.min(1, this.getCurrentBeat() / getSongBeatCount(this.getSong()!)));
  };

  public startInputMonitoring = async () => {
    return InputManager.startMonitoring();
  };

  public stopInputMonitoring = () => {
    return InputManager.stopMonitoring();
  };

  public update = () => {
    this.playerStates.forEach((player) => player.update());
  };
  public resetPlayerNotes = () => {
    this.playerStates.forEach((player) => player.resetNotes());
  };

  public isMergedTrack = () => this.getSingSetup()?.players.length !== 2;
}

export default new GameStateClass();
