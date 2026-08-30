import useSWR from 'swr';

import { SingSetup, Song } from '~/interfaces';
import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import { Skeleton } from '~/modules/elements/akui/skeleton';
import { fetchSongBoard, songBoardUrl } from '~/modules/leaderboard/client';
import LeaderboardRow from '~/modules/leaderboard/leaderboard-row';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  song: Song;
  singSetup: SingSetup;
  leaderboard: LeaderboardPostGame;
}

/** Enough to fill the column next to the local scores; the rest of the board scrolls. */
const VISIBLE_ROWS = 6;

/**
 * The tense of the position line. The score is sent on the way out of this screen, not on arrival,
 * so "is" only becomes true once the request has actually gone.
 */
const positionVerb = (leaderboard: LeaderboardPostGame) => {
  if (leaderboard.hasSubmitted) return 'is';

  return leaderboard.panel === 'armed' ? 'will be' : 'would be';
};

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
  const { songLeaderboardEnabled, hasLeaderboard, difficulty, score } = leaderboard;

  const shouldFetch = songLeaderboardEnabled && hasLeaderboard;

  const { data, error, isLoading } = useSWR(
    shouldFetch ? songBoardUrl({ songId: song.id, tolerance: singSetup.tolerance, score }) : null,
    fetchSongBoard,
    { revalidateOnFocus: false },
  );

  // Behind its own flag, and away entirely for the dev-only debug widths above Easy — those are
  // never stored, so the list would be permanently empty.
  if (!shouldFetch) return null;

  return (
    <Box
      className="w-full items-stretch gap-2 border border-white/10 bg-black/50 p-3 lg:w-[22rem] lg:shrink-0"
      data-test="song-leaderboard-panel">
      <Menu.SubHeader as="h2" className="text-active text-left font-bold">
        Online scores
      </Menu.SubHeader>
      {/* The board is one song at one difficulty, and the heading has no room to say so */}
      <Menu.HelpText className="text-left opacity-70">This song · {difficulty} · last 14 days</Menu.HelpText>

      {/* `total` is the board as it was read, which never counts this score — the player is the `+ 1` */}
      {data && data.position !== null && (
        <p className="typography text-sm" data-test="song-leaderboard-position">
          Your <ScoreText score={score} /> {positionVerb(leaderboard)}{' '}
          <strong className="text-active">#{data.position}</strong> of {data.total + 1}.
        </p>
      )}

      <div className="flex max-h-[16rem] flex-col gap-1 overflow-y-auto">
        {isLoading &&
          Array.from({ length: VISIBLE_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        {!isLoading && error && (
          <p className="typography text-sm opacity-70" data-test="song-leaderboard-error">
            Failed to load results
          </p>
        )}
        {!isLoading && !error && data?.entries.length === 0 && (
          <p className="typography text-sm opacity-70" data-test="song-leaderboard-empty">
            Nobody has shared a score for this song yet
          </p>
        )}
        {!error &&
          data?.entries.map((entry, index) => (
            <LeaderboardRow
              key={`${entry.name}-${entry.score}-${index}`}
              entry={entry}
              position={index + 1}
              withSongDetails={false}
              data-test="song-leaderboard-row"
            />
          ))}
      </div>
    </Box>
  );
}

export default SongLeaderboardPanel;
