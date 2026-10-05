import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';
import { useOnlineSongSelection } from '~/modules/online/song-selection-context';
import MicCheck from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check';
import { cn } from '~/utils/cn';

interface Props {
  /** Left out on a phone, where the tab the panel sits under already names it. */
  showTitle: boolean;
  className?: string;
}

/**
 * Who is about to sing — the mic check, or the room's singers in online mode — on the same surface
 * as the leaderboard beside it.
 */
function PlayersPanel({ showTitle, className }: Props) {
  const online = useOnlineSongSelection();

  return (
    <Box
      className={cn('min-h-0 w-full items-stretch justify-start gap-3 border border-white/10 p-3', className)}
      data-test="song-preview-players">
      {showTitle && (
        <div className="flex items-center justify-between gap-3">
          <Menu.Header as="h2">Players</Menu.Header>
          {online?.playersSummary}
        </div>
      )}
      {/* The panel is as tall as the layout leaves it, which on a phone is less than four rows */}
      <ScrollableColumn className="flex-1">{online ? online.playersView : <MicCheck />}</ScrollableColumn>
    </Box>
  );
}

export default PlayersPanel;
