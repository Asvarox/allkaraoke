import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Icon } from '~/modules/elements/akui/icon';
import { Flag } from '~/modules/elements/flag';
import { difficultyName } from '~/modules/leaderboard/difficulty';
import { BoardEntry } from '~/modules/leaderboard/types';
import ScoreboardRow from '~/modules/scoreboard/scoreboard-row';
import useInstrumentalsEnabled from '~/modules/songs/use-instrumentals-enabled';

// The leaderboards are the only screens that render a relative date
dayjs.extend(relativeTime);

interface Props {
  entry: BoardEntry;
  position: number;
  /** Off for a board that is already one song and one difficulty — both would be the same on every row. */
  withSongDetails?: boolean;
  highlighted?: boolean;
  scrollIntoView?: boolean;
  'data-test'?: string;
}

/** A {@link ScoreboardRow} built from a board row: the flag beside the name, the date relative. */
function LeaderboardRow({
  entry,
  position,
  withSongDetails = true,
  highlighted,
  scrollIntoView,
  'data-test': dataTest = 'leaderboard-row',
}: Props) {
  const showInstrumental = useInstrumentalsEnabled() && entry.instrumental;

  return (
    <ScoreboardRow
      position={position}
      score={entry.score}
      highlighted={highlighted}
      scrollIntoView={scrollIntoView}
      data-test={dataTest}
      name={
        <>
          <Flag isocode={entry.country ?? 'un'} loading="lazy" className="h-[1em] w-[1.5em] object-cover" />
          {entry.name}
        </>
      }
      subtitle={
        withSongDetails ? (
          <>
            {showInstrumental && (
              <Icon
                icon="ic:round-mic-off"
                aria-label="Instrumental"
                data-test="leaderboard-row-instrumental"
                className="mr-1 inline-block align-[-0.125em]"
              />
            )}
            {entry.artist} — {entry.title}
          </>
        ) : undefined
      }
      meta={[withSongDetails ? difficultyName(entry.tolerance) : null, dayjs(entry.createdAt).fromNow()]
        .filter(Boolean)
        .join(' · ')}
    />
  );
}

export default LeaderboardRow;
