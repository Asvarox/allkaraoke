import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ReactNode, useEffect, useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { DetailedScore, GAME_MODE, SingSetup } from '~/interfaces';
import GameState from '~/modules/game-engine/game-state/game-state';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import { LeaderboardCountrySetting, LeaderboardNameSetting } from '~/modules/leaderboard/identity';
import { LeaderboardSharingSetting, SharingDecision } from '~/modules/leaderboard/sharing';
import { BoardEntry, SongBoardResponse } from '~/modules/leaderboard/types';
import { PlayerNumber } from '~/modules/players/player-number';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import tuple from '~/modules/utils/tuple';
import PostGameView, { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';

import songTxt from '../../public/songs/2-plus-1-chodz-pomaluj-moj-swiat.txt?raw';

const song = convertTxtToSong(songTxt);

const SING_SETUP_ID = 'storybook-scoreboards';

const difficulties = { Hard: 1, Medium: 2, Easy: 3 } as const;

interface StoryArgs {
  difficulty: keyof typeof difficulties;
  score: number;
  /** How many rows the song's global board comes back with. */
  onlineRows: number;
  /** What `GET /leaderboard-song` does, so the loading and failure states are reachable too. */
  boardResponse: 'loaded' | 'empty' | 'loading' | 'error';
  /**
   * The player's standing decision, which is what the step renders under the boards: the prompt
   * while undecided, the identity panel once sharing, the way back in once declined.
   */
  sharing: SharingDecision | 'undecided';
}

const names = [
  ['Roksana', 'pl'],
  ['Mateusz', 'pl'],
  ['Ingrid', 'no'],
  ['Chidi', 'ng'],
  ['Yumi', 'jp'],
  ['Tomás', 'br'],
  ['Aoife', 'ie'],
  ['Dilnoza', 'uz'],
] as const;

const boardEntries = (count: number, tolerance: number): BoardEntry[] =>
  Array.from({ length: count }, (_, index) => ({
    name: names[index % names.length][0],
    country: names[index % names.length][1],
    score: 2_600_000 - index * 137_000,
    artist: song.artist,
    title: song.title,
    songId: song.id,
    tolerance,
    createdAt: Date.now() - (index + 1) * 7 * 60 * 60 * 1000,
  }));

/**
 * Stands in for `GET /leaderboard-song`. Storybook has no request-mocking addon, and the panel is
 * the only thing on this screen that talks to the network, so the story swaps `fetch` for that one
 * path and leaves every other request alone.
 *
 * Installed during render rather than in an effect: SWR fires on mount, which is before any effect
 * of a decorator wrapping it would run.
 */
function StubbedSongBoard({ args, children }: { args: StoryArgs; children: ReactNode }) {
  const [original] = useState(() => {
    const previous = window.fetch;

    window.fetch = (input, init) => {
      const url = String(input instanceof Request ? input.url : input);
      if (!url.includes('/leaderboard-song')) return previous(input, init);

      if (args.boardResponse === 'loading') return new Promise<Response>(() => {});
      if (args.boardResponse === 'error') return Promise.resolve(new Response('nope', { status: 500 }));

      const tolerance = difficulties[args.difficulty];
      const entries = args.boardResponse === 'empty' ? [] : boardEntries(args.onlineRows, tolerance);
      const payload: SongBoardResponse = {
        entries,
        total: entries.length,
        // Wherever the sung score falls among the canned rows
        position: entries.filter((entry) => entry.score >= args.score).length + 1,
      };

      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
    };

    return previous;
  });

  useEffect(() => () => void (window.fetch = original), [original]);

  return children;
}

const emptyDetailedScore: DetailedScore = {
  freestyle: 0,
  rap: 0,
  rapstar: 0,
  star: 0,
  normal: 0,
  perfect: 0,
  vibrato: 0,
};

/**
 * The high-scores step of the post-game flow, where the local and global scoreboards sit side by
 * side. `play` clicks through the results step to reach it.
 *
 * The scores on this screen come from `GameState` and `PlayersManager` rather than from props, so
 * the story seeds a sing setup and then fixes each player state's score — the real one is computed
 * from sung notes, which a story has no way to produce.
 */
const Template = (args: StoryArgs) => {
  const { width, height } = useViewportSize();

  const singSetup: SingSetup = {
    id: SING_SETUP_ID,
    players: [{ number: 0, track: 0 }],
    mode: GAME_MODE.PASS_THE_MIC,
    tolerance: difficulties[args.difficulty],
  };

  // The settings below are localStorage-backed and shared with every other story in the session, so
  // whatever was there is put back on the way out
  const [restoreSettings] = useState(() => {
    const previous = {
      sharing: LeaderboardSharingSetting.get(),
      name: LeaderboardNameSetting.get(),
      country: LeaderboardCountrySetting.get(),
    };

    LeaderboardSharingSetting.set(args.sharing === 'undecided' ? null : args.sharing);
    LeaderboardNameSetting.set('Player #1');
    LeaderboardCountrySetting.set('pl');

    GameState.setSong(song);
    GameState.setSingSetup(singSetup);
    // Patched on the states this story just created, not on the singleton — `getPlayerScore` still
    // runs its own code path (co-op averaging included) on top of them
    GameState.getPlayers().forEach((playerState) => (playerState.getScore = () => args.score));

    return () => {
      LeaderboardSharingSetting.set(previous.sharing);
      LeaderboardNameSetting.set(previous.name);
      LeaderboardCountrySetting.set(previous.country);
    };
  });

  useEffect(
    () => () => {
      GameState.resetSingSetup();
      restoreSettings();
    },
    [restoreSettings],
  );

  const players: PlayerScore[] = [
    {
      name: 'Player #1',
      playerNumber: 0 as PlayerNumber,
      detailedScore: tuple([emptyDetailedScore, emptyDetailedScore]),
    },
  ];

  return (
    <StubbedSongBoard args={args}>
      <PostGameView
        singSetup={singSetup}
        players={players}
        width={width}
        height={height}
        onClickSongSelection={() => undefined}
        song={song}
        highScores={[
          { singSetupId: SING_SETUP_ID, name: 'Player #1', score: args.score, date: new Date().toISOString() },
          { singSetupId: 'earlier-1', name: 'Smelly Cat', score: 2_400_000, date: '2026-03-04' },
          { singSetupId: 'earlier-2', name: 'Dat Boi', score: 1_650_000, date: '2025-11-14' },
          { singSetupId: 'earlier-3', name: 'Good Guy Greg', score: 1_300_000, date: '2025-04-02' },
          { singSetupId: 'earlier-4', name: 'Pepe', score: 950_000, date: '2024-06-19' },
        ].sort((first, second) => second.score - first.score)}
      />
    </StubbedSongBoard>
  );
};

const meta = {
  title: 'PostGame/Scoreboards',
  component: Template,
  argTypes: {
    difficulty: { control: 'radio', options: Object.keys(difficulties) },
    score: { control: { type: 'range', min: 0, max: 3_500_000, step: 50_000 } },
    onlineRows: { control: { type: 'range', min: 1, max: 20, step: 1 } },
    boardResponse: { control: 'radio', options: ['loaded', 'empty', 'loading', 'error'] },
    sharing: { control: 'radio', options: ['always', 'undecided', 'never'] },
  },
  args: {
    difficulty: 'Medium',
    score: 1_850_000,
    onlineRows: 6,
    boardResponse: 'loaded',
    // Not 'undecided': the prompt opens over the boards, and these stories are about the boards
    sharing: 'always',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: '720p' },
  },
} as Meta<ComponentProps<typeof Template>>;

type Story = StoryObj<typeof meta>;

/** Skips the results animation and lands on the step with both scoreboards. */
const goToScoreboards: Story['play'] = async ({ canvas }) => {
  await userEvent.click(await canvas.findByTestId('skip-animation-button', undefined, { timeout: 15_000 }));
  await userEvent.click(await canvas.findByTestId('highscores-button', undefined, { timeout: 15_000 }));

  await expect(await canvas.findByTestId('highscores-container')).toBeVisible();
};

export const ScoreboardsStory: Story = {
  play: goToScoreboards,
};

/** The first qualifying score, with the prompt still up over the boards. */
export const FirstScorePromptStory: Story = {
  args: { sharing: 'undecided' },
  play: goToScoreboards,
};

/** Easy is ranked on the song's own board and never on the main menu's — the copy has to say so. */
export const EasyScoreboardsStory: Story = {
  args: { difficulty: 'Easy' },
  play: goToScoreboards,
};

/** Nobody has shared a score for this song yet. */
export const EmptyBoardStory: Story = {
  args: { boardResponse: 'empty' },
  play: goToScoreboards,
};

/** The board is still loading — skeleton rows, and no position line yet. */
export const LoadingBoardStory: Story = {
  args: { boardResponse: 'loading' },
  play: goToScoreboards,
};

/** The request failed. The local scoreboard is unaffected. */
export const FailedBoardStory: Story = {
  args: { boardResponse: 'error' },
  play: goToScoreboards,
};

export default meta;
