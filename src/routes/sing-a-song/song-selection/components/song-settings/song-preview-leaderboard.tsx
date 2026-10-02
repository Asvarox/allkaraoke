import { SongPreview } from '~/interfaces';
import { Menu } from '~/modules/elements/akui/menu';
import { Selector } from '~/modules/elements/akui/selector';
import { difficultyName } from '~/modules/leaderboard/difficulty';
import LeaderboardRow from '~/modules/leaderboard/leaderboard-row';
import ScoreboardPanel from '~/modules/scoreboard/scoreboard-panel';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';
import useSongPreviewBoard from '~/routes/sing-a-song/song-selection/components/song-settings/use-song-preview-board';
import { cn } from '~/utils/cn';

interface Props {
  songPreview: SongPreview;
  /** 1-based, the way a sing setup carries it: 1 = Hard, 2 = Medium, 3 = Easy. */
  tolerance: number;
  onToleranceChange: (tolerance: number) => void;
  /** Left out on a phone, where the tab the board sits under already names it — the difficulty tabs too. */
  showTitle: boolean;
  className?: string;
}

/** Easiest first, the order the difficulties read in left to right. */
const TAB_TOLERANCES = [3, 2, 1];

/** The song's global board. Its tabs are the game's difficulty, not a filter of their own, so it always
 * lists the scores the next run would be ranked against. */
function SongPreviewLeaderboard({ songPreview, tolerance, onToleranceChange, showTitle, className }: Props) {
  const { enabled, rows, startPosition, ownRun, ownPosition, isLoading, error } = useSongPreviewBoard(
    songPreview,
    tolerance,
  );

  return (
    <ScoreboardPanel
      className={cn('min-h-0 border border-white/10 p-3', className)}
      // The panel is as tall as the layout makes it, so the list takes whatever the rest leaves
      listClassName="h-auto min-h-0 flex-1"
      title={showTitle ? 'Leaderboard' : undefined}
      actions={
        // A phone has the difficulty switcher right above; the tabs would only repeat it
        showTitle && (
          <Selector value={String(tolerance)} onChange={(value) => onToleranceChange(Number(value))} className="grow">
            {TAB_TOLERANCES.map((tabTolerance) => (
              <Selector.Item
                key={tabTolerance}
                value={String(tabTolerance)}
                size="mini"
                className="flex-1 px-2"
                data-test={`song-preview-leaderboard-tab-${tabTolerance}`}>
                {difficultyName(tabTolerance)}
              </Selector.Item>
            ))}
          </Selector>
        )
      }
      footer={
        ownRun && (
          <>
            <Menu.Divider />
            {/* Pinned under the list, so the player's standing stays in sight however far it scrolls */}
            <div className="flex items-center justify-between gap-3" data-test="song-preview-leaderboard-own-best">
              <Menu.HelpText className="min-w-0 truncate text-left">
                {[ownRun.name, 'your best', ownPosition !== null && `#${ownPosition}`].filter(Boolean).join(' · ')}
              </Menu.HelpText>
              <span className="typography text-active shrink-0 font-semibold">
                <ScoreText score={ownRun.score} />
              </span>
            </div>
          </>
        )
      }
      isLoading={isLoading}
      error={error}
      isEmpty={rows.length === 0}
      emptyMessage={enabled ? 'Nobody has shared a score on this difficulty yet' : 'No leaderboard for this difficulty'}
      data-test="song-preview-leaderboard">
      {rows.map(({ entry, isPlayer }, index) => (
        <LeaderboardRow
          key={`${entry.name}-${entry.score}-${index}`}
          entry={entry}
          position={startPosition + index}
          withSongDetails={false}
          highlighted={isPlayer}
          scrollIntoView={isPlayer}
          data-test={isPlayer ? 'song-preview-leaderboard-own-row' : 'song-preview-leaderboard-row'}
        />
      ))}
    </ScoreboardPanel>
  );
}

export default SongPreviewLeaderboard;
