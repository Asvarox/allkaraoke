import PlayerState from 'Scenes/Game/Singing/GameState/PlayerState';
import getSongBeatCount from 'Songs/utils/getSongBeatCount';
import getSongBeatLength from 'Songs/utils/getSongBeatLength';
import { GAME_MODE, SingSetup, Song } from 'interfaces';
import tuple from 'utils/tuple';
import InputManager from '../Input/InputManager';
import { addDetailedScores, beatsToPoints, divideDetailedScores } from './Helpers/calculateScore';
import getCurrentBeat from './Helpers/getCurrentBeat';

export class GameStateClass {
  private song: Song | null = null;
  private currentTime: number = 0;
  private duration: number = 0;
  private singSetup: SingSetup | null = null;
  private playerStates: PlayerState[] = [];
  private playing: boolean = false;

  public setCurrentTime = (currentTime: number) => (this.currentTime = currentTime);
  public getCurrentTime = (accountGap = true) => {
    return this.currentTime - (accountGap && this.song ? this.song.gap : 0);
  };

  public getSongBeatLength = () => getSongBeatLength(this.song!);
  public getCurrentBeat = () => {
    return getCurrentBeat(this.getCurrentTime(), this.getSongBeatLength(), 0, false);
  };

  public setSong = (song: Song) => (this.song = song);
  public getSong = () => this.song;

  public getSingSetup = () => this.singSetup;
  public setSingSetup = (singSetup: SingSetup) => {
    this.singSetup = singSetup;

    this.playerStates = singSetup.players.map(({ number }, index) => new PlayerState(number, this));
    this.currentTime = 0;
    this.playing = true;
  };

  public resetSingSetup = () => {
    this.playing = false;
  };

  public isPlaying = () => this.playing;

  public getTolerance = () => this.getSingSetup()?.tolerance ?? 2;

  public setDuration = (duration: number) => (this.duration = duration);
  public getDuration = () => this.duration;

  public getPlayer = (playerNumber: 0 | 1 | 2 | 3) =>
    this.playerStates.find((player) => player.getNumber() === playerNumber);

  public getPlayers = () => this.playerStates;

  public getPlayerCount = () => this.playerStates.length;

  public getPlayerScore = (player: 0 | 1 | 2 | 3) => {
    if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
      const score = this.getPlayers().reduce((curr, playerState) => curr + playerState.getScore(), 0);

      return score / this.getPlayerCount();
    } else {
      return this.getPlayer(player)?.getScore() ?? -1;
    }
  };

  public getPlayerDetailedScore = (player: 0 | 1 | 2 | 3) => {
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

  public getSongCompletionProgress = () => {
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
