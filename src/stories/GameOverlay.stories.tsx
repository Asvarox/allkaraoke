import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { VideoState } from 'Elements/VideoPlayer';
import PlayersManager from 'Players/PlayersManager';
import CanvasDrawing from 'Scenes/Game/Singing/GameOverlay/Drawing';
import ParticleManager from 'Scenes/Game/Singing/GameOverlay/Drawing/ParticleManager';
import GameOverlay from 'Scenes/Game/Singing/GameOverlay/GameOverlay';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import { processSong } from 'Songs/utils/processSong/processSong';
import { GAME_MODE, SingSetup } from 'interfaces';
import { ComponentProps, useEffect, useMemo, useRef } from 'react';
import { useUpdate } from 'react-use';
import { txtfile } from 'stories/songFixture';
import { ValuesType } from 'utility-types';
import 'utils/exposeSingletons';

interface StoryArgs {
  tolerance: number;
  speed: number;
  progress: number;
  playerNum: number;
  gameMode: ValuesType<typeof GAME_MODE>;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Game/Singing/GameOverlay',
  component: GameOverlay,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    playerNum: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    progress: { control: { type: 'range', min: 1, max: 100, step: 0.25 } },
    speed: { control: { type: 'range', min: 1, max: 200, step: 1 } },
    tolerance: { control: { type: 'range', min: 0, max: 6, step: 1 } },
    gameMode: { control: 'radio', options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP] },
  },
  args: {
    playerNum: 2,
    progress: 50,
    tolerance: 3,
    speed: 100,
    gameMode: GAME_MODE.DUEL,
  },
} as Meta<ComponentProps<typeof GameOverlay>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<StoryArgs> = (args) => {
  const ref = useRef<CanvasDrawing | null>(null);
  const duration = 10_000;
  const song = processSong(convertTxtToSong(txtfile));
  song.bpm = song.bpm * (args.speed / 100);
  const update = useUpdate();

  const singSetup: SingSetup = useMemo(() => {
    const setup = {
      tolerance: args.tolerance,
      players: new Array(args.playerNum).fill(0).map((t, i) => ({ number: i as 0 | 1 | 2 | 3, track: 0 })),
      id: 'storybook-id',
      mode: args.gameMode,
    };

    PlayersManager.getPlayers().forEach((player) => PlayersManager.removePlayer(player.number));
    setup.players.map((player) => PlayersManager.addPlayer(player.number));

    GameState.resetSingSetup();
    GameState.setSong(song);
    GameState.setSingSetup(setup);

    return setup;
  }, [args.tolerance, args.playerNum, args.gameMode]);

  useEffect(() => {
    GameState.resetSingSetup();
    GameState.setSingSetup(singSetup);
    GameState.setSong(song);

    const DRAWN_SECONDS = ((duration / 100) * args.progress) / 1000;

    const FPS = 30;

    ref.current?.resume();
    for (let i = 0; i < FPS * DRAWN_SECONDS; i++) {
      const currentTime = i * (1000 / FPS);
      GameState.setCurrentTime(currentTime);
      GameState.update();
    }
    setTimeout(() => {
      ref.current?.pause?.();
      ParticleManager.clearAll();
    }, 100);
    update();
  }, [args.progress]);

  return (
    <div style={{ position: 'relative', width: 1280, height: 720 }}>
      <GameOverlay
        ref={ref}
        duration={duration}
        effectsEnabled={true}
        song={song}
        videoPlayerRef={null}
        currentStatus={VideoState.PLAYING}
        onSongEnd={() => {
          GameState.resetSingSetup();
          GameState.setSingSetup(singSetup);
          GameState.setSong(song);
        }}
        playerSetups={singSetup.players}
        width={1280}
        isPauseMenuVisible={false}
        height={720}
      />
    </div>
  );
};

const Test = Template.bind({});

type Story = StoryObj<typeof Test>;

export const GameOverlayStory = {
  render: (args) => <Test {...args} />,
} satisfies Story;
