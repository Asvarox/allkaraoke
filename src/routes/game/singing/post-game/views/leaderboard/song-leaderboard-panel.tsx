import { useMemo } from 'react';
import useSWR from 'swr';

import { SingSetup, Song } from '~/interfaces';
import { Skeleton } from '~/modules/elements/akui/skeleton';
import { fetchSongBoard, songBoardUrl } from '~/modules/leaderboard/client';
import LeaderboardRow from '~/modules/leaderboard/leaderboard-row';
import { BoardEntry } from '~/modules/leaderboard/types';
import ScoreboardPanel from '~/modules/scoreboard/scoreboard-panel';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  song: Song;
  singSetup: SingSetup;
  leaderboard: LeaderboardPostGame;
}

/** Enough to fill the column next to the local scores; the rest of the board scrolls. */
const VISIBLE_ROWS = 6;

/**
 * The global board for the song just sung, sitting beside the local high scores.
 *
 * Split by difficulty and nothing else — the vocal track is deliberately not part of the split, so
 * both singers of a duet are ranked together. That split is also why Easy belongs here while it is
 * kept off the main menu's board: ranked only against other Easy runs of the same song, it is
 * comparing like with like.
 *
 * Rendering does not depend on the score qualifying: a player who is nowhere near the board still
 * gets told where they would have landed, which is the only reason to show it to them at all.
 */
function SongLeaderboardPanel({ song, singSetup, leaderboard }: Props) {
  const { songLeaderboardEnabled, hasLeaderboard, difficulty, score, name, country } = leaderboard;

  const shouldFetch = songLeaderboardEnabled && hasLeaderboard;

  const { data, error, isLoading } = useSWR(
    shouldFetch ? songBoardUrl({ songId: song.id, tolerance: singSetup.tolerance, score }) : null,
    fetchSongBoard,
    { revalidateOnFocus: false },
  );

  /**
   * The board as the player should read it: the window the Worker returned with the run just sung
   * slotted into place, rather than a list they then have to find themselves in.
   *
   * The row is synthetic — the score has usually not been submitted yet, and after it has, nothing
   * refetches. Ranks come out right either way: the rows above the insertion keep theirs, and the
   * ones below are pushed down by exactly the one row that joined them.
   */
  const rows = useMemo(() => {
    if (!data) return [];

    const listed = data.entries.map((entry) => ({ entry, isPlayer: false }));
    if (data.position === null) return listed;

    const player: BoardEntry = {
      name: name.trim() || 'You',
      country: country || null,
      score,
      artist: song.artist,
      title: song.title,
      songId: song.id,
      tolerance: singSetup.tolerance,
      createdAt: Date.now(),
    };

    const index = Math.min(Math.max(data.position - data.startPosition, 0), listed.length);
    listed.splice(index, 0, { entry: player, isPlayer: true });

    return listed;
  }, [data, name, country, score, song, singSetup.tolerance]);

  // Behind its own flag, and away entirely for the dev-only debug widths above Easy — those are
  // never stored, so the list would be permanently empty.
  if (!shouldFetch) return null;

  return (
    <ScoreboardPanel
      title="Global scoreboard"
      // The count the removed "of N" sentence used to carry — the player's own row says the rest
      subtitle={`This song · ${difficulty} · all time${data ? ` · ${data.total + 1} scores` : ''}`}
      data-test="song-leaderboard-panel">
      {isLoading &&
        Array.from({ length: VISIBLE_ROWS }, (_, index) => <Skeleton key={index} className="h-12 w-full rounded-xl" />)}
      {!isLoading && error && (
        <p className="typography text-sm opacity-70" data-test="song-leaderboard-error">
          Failed to load results
        </p>
      )}
      {/* Only with no score to place — one that lands on an empty board is shown as its first row */}
      {!isLoading && !error && rows.length === 0 && (
        <p className="typography text-sm opacity-70" data-test="song-leaderboard-empty">
          Nobody has shared a score for this song yet
        </p>
      )}
      {!error &&
        rows.map(({ entry, isPlayer }, index) => (
          <LeaderboardRow
            key={`${entry.name}-${entry.score}-${index}`}
            entry={entry}
            position={(data?.startPosition ?? 1) + index}
            withSongDetails={false}
            highlighted={isPlayer}
            scrollIntoView={isPlayer}
            data-test={isPlayer ? 'song-leaderboard-own-row' : 'song-leaderboard-row'}
          />
        ))}
    </ScoreboardPanel>
  );
}

export default SongLeaderboardPanel;
