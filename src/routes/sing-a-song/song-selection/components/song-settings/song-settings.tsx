import { useState } from 'react';

import { SingSetup, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import Box from '~/modules/elements/akui/primitives/box';
import { Selector } from '~/modules/elements/akui/selector';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import events from '~/modules/game-events/game-events';
import { usePhoneOrientation } from '~/modules/hooks/use-breakpoint';
import { useOnlineSongSelection } from '~/modules/online/song-selection-context';
import { useDifficultySetting } from '~/routes/sing-a-song/song-selection/components/song-settings/difficulty';
import GameSettings from '~/routes/sing-a-song/song-selection/components/song-settings/game-settings';
import PlayersPanel from '~/routes/sing-a-song/song-selection/components/song-settings/players-panel';
import SongPreviewLeaderboard from '~/routes/sing-a-song/song-selection/components/song-settings/song-preview-leaderboard';
import { cn } from '~/utils/cn';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

type Panel = 'leaderboard' | 'players';

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
  const online = useOnlineSongSelection();
  const [pendingSetup, setPendingSetup] = useState<SingSetup | null>(null);
  const [tolerance, setTolerance] = useDifficultySetting(1);

  // A phone, either way up — the split the layout's grid makes: under `md` upright, under `lg` sideways
  const isPhone = usePhoneOrientation() !== null;
  // A phone has room for one of the two panels at a time, and the leaderboard is the one that's new
  const [panel, setPanel] = useState<Panel>('leaderboard');

  const startSong = (setup: SingSetup) => {
    events.songStarted.dispatch(songPreview, setup);
    onPlay({ song: songPreview, ...setup });
  };

  const handlePlay = (setup: SingSetup) => {
    if (songPreview.isUnverifiedSong) {
      setPendingSetup(setup);
      return;
    }

    startSong(setup);
  };

  const confirmPlayUnverifiedSong = () => {
    if (!pendingSetup) {
      return;
    }

    startSong(pendingSetup);
  };

  const isConfirmModalOpen = pendingSetup !== null;

  return (
    <>
      {/* Controlled: the confirmation isn't a button away, it's what "play" turns into when the song
          happens to be unverified. */}
      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={(open) => !open && setPendingSetup(null)}
        title="Unverified Shared Song"
        description="This shared song is unverified and might not work correctly. Continue anyway?"
        onConfirm={confirmPlayUnverifiedSong}
        dataTestPrefix="unverified-shared-song-confirm"
        cancelButton={
          <ConfirmModal.CancelButton name="cancel-play-unverified-song" isDefault={false}>
            Cancel
          </ConfirmModal.CancelButton>
        }
        confirmButton={
          <ConfirmModal.ConfirmButton name="confirm-play-unverified-song" isDefault>
            Continue
          </ConfirmModal.ConfirmButton>
        }
      />
      <GameSettings
        songPreview={songPreview}
        tolerance={tolerance}
        onToleranceChange={setTolerance}
        onNextStep={handlePlay}
        keyboardControl={keyboardControl}
        onExitKeyboardControl={onExitKeyboardControl}
        compact={isPhone}
      />
      <SongPreviewLayout.Slot name="panels">
        <div className={cn(SongPreviewLayout.area.panels, 'flex min-h-0 flex-col gap-2')}>
          {isPhone && (
            // Held sideways the tabs are the top of the screen's right edge, just clear of the app's toolbar there
            <Selector value={panel} onChange={(value) => setPanel(value as Panel)} className="max-lg:landscape:mr-27">
              <Selector.Item
                value="leaderboard"
                size="mini"
                // Shrinks with the other tab, its label truncated, rather than pushing it out of view
                className="h-11 min-w-0 flex-1"
                data-test="song-preview-panel-leaderboard">
                <span className="min-w-0 truncate">{online?.chatView ? 'Chat' : 'Leaderboard'}</span>
              </Selector.Item>
              <Selector.Item
                value="players"
                size="mini"
                className="h-11 min-w-0 flex-1"
                data-test="song-preview-panel-players">
                <span className="min-w-0 truncate">Players</span>
              </Selector.Item>
            </Selector>
          )}
          {(!isPhone || panel === 'players') && (
            <PlayersPanel showTitle={!isPhone} className={cn(SongPreviewLayout.area.players, 'flex-1')} />
          )}
          {(!isPhone || panel === 'leaderboard') && online?.chatView && (
            <Box
              className={cn(
                SongPreviewLayout.area.board,
                'min-h-0 flex-1 items-stretch justify-start border border-white/10 p-3',
              )}>
              {online.chatView}
            </Box>
          )}
          {(!isPhone || panel === 'leaderboard') && !online?.chatView && (
            <SongPreviewLeaderboard
              songPreview={songPreview}
              // The setting is stored 0-based; the board counts tolerance the way a sing setup does
              tolerance={tolerance + 1}
              onToleranceChange={(boardTolerance) => setTolerance(boardTolerance - 1)}
              showTitle={!isPhone}
              className={cn(SongPreviewLayout.area.board, 'flex-1')}
            />
          )}
        </div>
      </SongPreviewLayout.Slot>
    </>
  );
}
