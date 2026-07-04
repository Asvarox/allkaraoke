import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { expect } from 'storybook/test';
import { ValuesType } from 'utility-types';
import { DetailedScore, GAME_MODE, SingSetup } from '~/interfaces';
import { MAX_POINTS, beatsToPoints, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import tuple from '~/modules/utils/tuple';
import PostGameView, { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import song from '../../public/songs/2-plus-1-chodz-pomaluj-moj-swiat.txt?raw';

interface StoryArgs {
  playerNum: number;
  player0Score: number;
  player1Score: number;
  player2Score: number;
  player3Score: number;
  gameMode: ValuesType<typeof GAME_MODE>;
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args: StoryArgs) => {
  const { width, height } = useViewportSize();
  // GameState.setSong(song as Song);

  const singSetup: SingSetup = {
    tolerance: 2,
    players: new Array(args.playerNum).fill(0).map((_t, i) => ({ number: i as 0 | 1 | 2 | 3, track: 0 })),
    id: 'storybook-id',
    mode: args.gameMode,
  };

  const maxPoints: DetailedScore = {
    freestyle: 10,
    rap: 10,
    rapstar: 0,
    star: 90,
    normal: 705,
    perfect: 375,
    vibrato: 187.5,
  };

  const pointsPerBeat = MAX_POINTS / sumDetailedScore(maxPoints);

  const maxScores = beatsToPoints(maxPoints, pointsPerBeat);
  const players: PlayerScore[] = new Array(args.playerNum).fill(0).map((_t, i) => {
    const playerNum = i as 0 | 1 | 2 | 3;

    return {
      name: `Player #${i + 1}`,
      playerNumber: playerNum,
      detailedScore: tuple([
        {
          freestyle: ((args[`player${playerNum}Score`] * 3) / 100) * maxPoints.freestyle * pointsPerBeat,
          rap: ((args[`player${playerNum}Score`] * 2) / 100 / 2) * maxPoints.rap * pointsPerBeat,
          rapstar: 0,
          star: (args[`player${playerNum}Score`] / 100 / 3) * maxPoints.star * pointsPerBeat,
          normal: ((args[`player${playerNum}Score`] * 4) / 100 / 4) * maxPoints.normal * pointsPerBeat,
          perfect: (args[`player${playerNum}Score`] / 100 / 5) * maxPoints.perfect * pointsPerBeat,
          vibrato: (args[`player${playerNum}Score`] / 100 / 6) * maxPoints.vibrato * pointsPerBeat,
        },
        maxScores,
      ]),
    };
  });

  return (
    <PostGameView
      singSetup={singSetup}
      players={players}
      width={width}
      height={height}
      onClickSongSelection={() => undefined}
      song={convertTxtToSong(song)}
      highScores={[
        {
          singSetupId: 'some-other-sings1',
          name: players[0].name,
          date: '2022-10-10',
          score: 2_400_000,
        },
        {
          singSetupId: 'some-other-sings2',
          name: players[0].name,
          date: '2022-10-10',
          score: 2_400_000,
        },
        {
          singSetupId: 'some-other-sings3',
          name: players[0].name,
          date: '2022-10-10',
          score: 2_400_000,
        },
        {
          singSetupId: 'some-other-sings3',
          name: players[0].name,
          date: '2022-10-10',
          score: 2_400_000,
        },
        {
          singSetupId: 'storybook-id',
          name: players[0].name,
          score: sumDetailedScore(players[0].detailedScore[1]),
          date: '2022-10-11',
        },
      ]}
    />
  );
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'PostGame',
  component: Template,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    gameMode: {
      control: 'radio',
      options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP],
    },
    playerNum: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    player0Score: { control: 'range', min: 0, max: 100 },
    player1Score: { control: 'range', min: 0, max: 100 },
    player2Score: { control: 'range', min: 0, max: 100 },
    player3Score: { control: 'range', min: 0, max: 100 },
  },
  args: {
    gameMode: GAME_MODE.DUEL,
    playerNum: 2,
    player0Score: 68,
    player1Score: 69,
    player2Score: 70,
    player3Score: 71,
  },
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<ComponentProps<typeof Template>>;

type Story = StoryObj<typeof meta>;

export const PostGameStory: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByTestId('highscores-button', undefined, { timeout: 15_000 })).toBeVisible();
  },
};

export default meta;
