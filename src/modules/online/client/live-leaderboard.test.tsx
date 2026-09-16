import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GameState from '~/modules/game-engine/game-state/game-state';
import {
  leaderOf,
  LIVE_SCORE_REFRESH_MS,
  readOwnScore,
  useLiveOnlineLeader,
  withOwnScore,
} from '~/modules/online/client/live-leaderboard';
import OnlineClient from '~/modules/online/client/online-client';
import { LeaderboardEntry } from '~/modules/online/protocol/types';
import LeaderboardOverlay from '~/routes/online/singing/leaderboard-overlay';

const SELF = 'self';

const entry = (participantId: string, playerNumber: 0 | 1 | 2, score: number): LeaderboardEntry => ({
  participantId,
  name: participantId,
  playerNumber,
  score,
});

/** What the room last pushed: the other singer ahead, this one a second or two behind itself. */
const roomBoard = [entry('other', 0, 5_000), entry(SELF, 1, 3_000)];

/** Stands in for the game engine, which only exposes a score through its singletons. */
const singAs = (playerNumber: number, score: () => number) => {
  vi.spyOn(GameState, 'isPlaying').mockReturnValue(true);
  vi.spyOn(GameState, 'getPlayerScore').mockImplementation((player) => (player === playerNumber ? score() : -1));
};

const pushLeaderboard = (board: LeaderboardEntry[]) => {
  act(() => {
    OnlineClient.subscriptions.handlePublish('leaderboard', board);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(OnlineClient, 'getParticipantId').mockReturnValue(SELF);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('withOwnScore', () => {
  it('swaps in the local score and re-ranks, so an overtake shows at once', () => {
    const board = withOwnScore(roomBoard, SELF, 7_000);

    expect(board.map(({ participantId, score }) => [participantId, score])).toEqual([
      [SELF, 7_000],
      ['other', 5_000],
    ]);
    // The room's own copy is left alone — it is shared with every other reader.
    expect(roomBoard[1].score).toBe(3_000);
  });

  it('hands back the same board when there is nothing to change', () => {
    // Callers put the board in dependency arrays, so a fresh copy would re-render them for nothing.
    expect(withOwnScore(roomBoard, SELF, null)).toBe(roomBoard);
    expect(withOwnScore(roomBoard, SELF, 3_000)).toBe(roomBoard);
    expect(withOwnScore(roomBoard, 'not-on-the-board', 9_000)).toBe(roomBoard);
  });
});

describe('leaderOf', () => {
  it('names the top singer, and nobody on a tie or an empty board', () => {
    expect(leaderOf(roomBoard)).toBe(0);
    expect(leaderOf([entry('a', 0, 10), entry('b', 1, 10)])).toBeNull();
    expect(leaderOf([])).toBeNull();
  });
});

describe('readOwnScore', () => {
  it('reads nothing from a game engine that is not singing', () => {
    // What the engine still holds after a previous game is that game's score, not this one's.
    vi.spyOn(GameState, 'isPlaying').mockReturnValue(false);
    vi.spyOn(GameState, 'getPlayerScore').mockReturnValue(123_456);

    expect(readOwnScore(1)).toBeNull();
  });

  it('reads nothing for a player the engine does not have yet', () => {
    singAs(0, () => 1_000);

    expect(readOwnScore(1)).toBeNull();
    expect(readOwnScore(undefined)).toBeNull();
  });

  it('floors, the way every online screen shows a score', () => {
    singAs(1, () => 1_234.9);

    expect(readOwnScore(1)).toBe(1_234);
  });
});

describe('LeaderboardOverlay', () => {
  it('shows your own score as your game has it, not as the room last heard it', () => {
    let ownScore = 3_000;
    singAs(1, () => ownScore);
    const { container } = render(<LeaderboardOverlay />);
    pushLeaderboard(roomBoard);

    // The room has not pushed anything new — only the local game has moved on.
    ownScore = 8_250;
    act(() => {
      vi.advanceTimersByTime(LIVE_SCORE_REFRESH_MS);
    });

    const ownRow = container.querySelector('[data-test="online-leaderboard-entry-1"]');
    expect(ownRow).toHaveTextContent('8,250');
    // ...and already on top, rather than waiting for the room to agree.
    expect(container.querySelector('[data-test^="online-leaderboard-entry-"]')).toBe(ownRow);
  });
});

describe('useLiveOnlineLeader', () => {
  it('moves the medal the moment you overtake', () => {
    let ownScore = 3_000;
    singAs(1, () => ownScore);
    const { result } = renderHook(() => useLiveOnlineLeader());
    pushLeaderboard(roomBoard);
    expect(result.current).toBe(0);

    ownScore = 6_000;
    act(() => {
      vi.advanceTimersByTime(LIVE_SCORE_REFRESH_MS);
    });

    expect(result.current).toBe(1);
  });

  it('does not re-render while the score climbs without changing who leads', () => {
    // The singing screen that reads this is far heavier than the leaderboard.
    let ownScore = 3_000;
    singAs(1, () => ownScore);
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useLiveOnlineLeader();
    });
    pushLeaderboard(roomBoard);
    const settled = renders;

    for (let step = 0; step < 10; step++) {
      ownScore += 100;
      act(() => {
        vi.advanceTimersByTime(LIVE_SCORE_REFRESH_MS);
      });
    }

    expect(renders).toBe(settled);
  });
});
