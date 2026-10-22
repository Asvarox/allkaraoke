import { Meta, StoryObj } from '@storybook/react-vite';

import { GAME_MODE, SingSetup } from '~/interfaces';
import { regularBackgroundGradient } from '~/modules/elements/layout-with-background';
import GameState from '~/modules/game-engine/game-state/game-state';
import { PlayerNumber } from '~/modules/players/player-number';
import PlayersManager from '~/modules/players/players-manager';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { processSong } from '~/modules/songs/utils/process-song/process-song';
import { txtfile } from '~/stories/song-fixture';

import Lyrics from './lyrics';

interface StoryArgs {
  gameMode: (typeof GAME_MODE)[keyof typeof GAME_MODE];
  playerCount: number;
  /** Which line (notes section) of the fixture song is currently sung. */
  lineIndex: number;
  /** Current beat relative to the first note of the line; negative values land in the headstart. */
  beatsIntoLine: number;
  /** Pass the mic only: how many sections after the current one the mic changes hands. */
  passTheMicChangeIn?: number;
  bottom: boolean;
  effectsEnabled: boolean;
  showStatusForAllPlayers: boolean;
}

// Half the fixture's tempo, so a mic change a line ahead is still further than the 2.5s blink threshold
const BPM = 100;

function setupGameState(args: StoryArgs) {
  const song = processSong(convertTxtToSong(txtfile));
  song.bpm = BPM;

  const track = song.tracks[0];
  const notesSections = track.sections.filter(isNotesSection);
  const line = notesSections[Math.min(args.lineIndex, notesSections.length - 1)];
  const sectionIndex = track.sections.indexOf(line);

  const changeSection =
    args.passTheMicChangeIn !== undefined ? track.sections[sectionIndex + args.passTheMicChangeIn] : undefined;
  track.changes = changeSection ? [changeSection.start] : [];

  const singSetup: SingSetup = {
    id: 'storybook-lyrics',
    tolerance: 3,
    mode: args.gameMode,
    players: new Array(args.playerCount).fill(0).map((_, i) => ({ number: i as PlayerNumber, track: 0 })),
  };

  GameState.resetSingSetup();
  PlayersManager.getPlayers().forEach((player) => PlayersManager.removePlayer(player.number));
  singSetup.players.forEach((player) => PlayersManager.addPlayer(player.number));

  GameState.setSong(song);
  GameState.setSingSetup(singSetup);

  const beat = line.notes[0].start + args.beatsIntoLine;
  GameState.setCurrentTime(song.gap + beat * getSongBeatLength(song));
}

export default {
  title: 'Game/Singing/Lyrics',
  argTypes: {
    gameMode: { control: 'radio', options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP] },
    playerCount: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    lineIndex: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    beatsIntoLine: { control: { type: 'range', min: -10, max: 40, step: 0.5 } },
    passTheMicChangeIn: { control: { type: 'range', min: 1, max: 4, step: 1 } },
  },
  args: {
    gameMode: GAME_MODE.DUEL,
    playerCount: 1,
    lineIndex: 1,
    beatsIntoLine: 12,
    bottom: false,
    effectsEnabled: true,
    showStatusForAllPlayers: false,
  },
  beforeEach: ({ args }) => setupGameState(args),
  render: (args) => (
    // Keyed by args, so a control change remounts the lyrics with the freshly seeded game state
    <div key={JSON.stringify(args)} className="min-h-screen" style={{ backgroundImage: regularBackgroundGradient }}>
      <Lyrics
        player={PlayersManager.getPlayer(0)!}
        bottom={args.bottom}
        effectsEnabled={args.effectsEnabled}
        showStatusForAllPlayers={args.showStatusForAllPlayers}
      />
    </div>
  ),
} satisfies Meta<StoryArgs>;

type Story = StoryObj<StoryArgs>;

export const MidLine: Story = {};

export const Headstart: Story = {
  args: { beatsIntoLine: -3 },
};

export const FirstLine: Story = {
  args: { lineIndex: 0, beatsIntoLine: 0 },
};

export const LastLine: Story = {
  args: { lineIndex: 4, beatsIntoLine: 8 },
};

export const BottomPlayer: Story = {
  args: { bottom: true },
};

export const EffectsDisabled: Story = {
  args: { effectsEnabled: false },
};

export const StatusForAllPlayers: Story = {
  args: { playerCount: 4, showStatusForAllPlayers: true },
};

export const PassTheMicUpcoming: Story = {
  args: { gameMode: GAME_MODE.PASS_THE_MIC, playerCount: 2, passTheMicChangeIn: 3 },
};

export const PassTheMicOnNextLine: Story = {
  args: { gameMode: GAME_MODE.PASS_THE_MIC, playerCount: 2, passTheMicChangeIn: 2 },
};

export const PassTheMicOnCurrentLine: Story = {
  args: { gameMode: GAME_MODE.PASS_THE_MIC, playerCount: 2, passTheMicChangeIn: 1, beatsIntoLine: 4 },
};

export const PassTheMicImminent: Story = {
  args: { gameMode: GAME_MODE.PASS_THE_MIC, playerCount: 2, passTheMicChangeIn: 1, beatsIntoLine: 24 },
  // The container blinks in an endless loop, so no two screenshots of it are the same
  tags: ['no-screenshot'],
};
