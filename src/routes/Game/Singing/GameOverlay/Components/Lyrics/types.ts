import { GAME_MODE, songBeat } from '~/interfaces';
import { PlayerEntity } from '~/modules/Players/PlayersManager';

export interface LyricsProps {
  player: PlayerEntity;
  bottom?: boolean;
  effectsEnabled: boolean;
  showStatusForAllPlayers: boolean;
}

export type PassTheMicUiState = {
  shouldBlink: boolean;
  showProgressBar: boolean;
  progressPercent: number;
  showSwapOnCurrentLine: boolean;
  showSwapOnNextLine: boolean;
};

export type GameMode = (typeof GAME_MODE)[keyof typeof GAME_MODE];

export type PassTheMicUiArgs = {
  mode: GameMode | undefined;
  changes: songBeat[];
  sectionStart: songBeat | null;
  nextSectionStart: songBeat | null;
  subsequentSectionStart: songBeat | null;
  currentBeat: songBeat;
  beatLengthMs: number;
};
