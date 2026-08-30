import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Flag } from '~/modules/elements/flag';
import { difficultyName } from '~/modules/leaderboard/difficulty';
import { BoardEntry } from '~/modules/leaderboard/types';
import ScoreboardRow from '~/modules/scoreboard/scoreboard-row';

// The leaderboards are the only screens that render a relative date
dayjs.extend(relativeTime);

interface Props {
  entry: BoardEntry;
  position: number;
  /** Off for a board that is already one song and one difficulty — both would be the same on every row. */
  withSongDetails?: boolean;
  'data-test'?: string;
}

/** A {@link ScoreboardRow} built from a board row: the flag beside the name, the date relative. */
function LeaderboardRow({ entry, position, withSongDetails = true, 'data-test': dataTest = 'leaderboard-row' }: Props) {
  return (
    <ScoreboardRow
      position={position}
      score={entry.score}
      data-test={dataTest}
      name={
        <>
          <Flag isocode={entry.country ?? 'un'} loading="lazy" className="h-[1em] w-[1.5em] object-cover" />
          {entry.name}
        </>
      }
      subtitle={withSongDetails ? `${entry.artist} — ${entry.title}` : undefined}
      meta={[withSongDetails ? difficultyName(entry.tolerance) : null, dayjs(entry.createdAt).fromNow()]
        .filter(Boolean)
        .join(' · ')}
    />
  );
}

export default LeaderboardRow;
