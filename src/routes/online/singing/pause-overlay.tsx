import { ComponentProps, ReactNode } from 'react';

import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav, { KeyboardNavContext, useRegister } from '~/modules/hooks/use-keyboard-nav';
import { useOnlineLeaderboard } from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { formatScore } from '~/modules/online/format-score';
import { OnlineParticipant, OnlinePauseState } from '~/modules/online/protocol/types';
import ParticipantSlot from '~/routes/online/components/participant-slot';
import CountdownOverlay from '~/routes/online/singing/countdown-overlay';
import { InGameInputLag, InGameMicSwitcher } from '~/routes/settings/in-game-audio-settings';

interface Props {
  pause: OnlinePauseState;
  resumeCountdownEndsAt: number | null;
  onResume: () => void;
  isHost: boolean;
  hostId: string | null;
  participants: OnlineParticipant[];
}

interface PauseButtonProps extends Omit<ComponentProps<typeof MenuButton>, 'onClick' | 'children'> {
  name: string;
  onClick: () => void;
  isDefault?: boolean;
  children: ReactNode;
}

/** A pause-menu button that registers from its own render, so it keeps its visual place in the
 * keyboard navigation order — same reason the settings rows do, see `in-game-audio-settings.tsx`. */
function PauseButton({ name, onClick, isDefault = false, children, ...props }: PauseButtonProps) {
  const register = useRegister();

  return (
    <MenuButton {...props} {...register(name, onClick, undefined, isDefault)}>
      {children}
    </MenuButton>
  );
}

function PauseOverlay({ pause, resumeCountdownEndsAt, onResume, isHost, hostId, participants }: Props) {
  const leaderboard = useOnlineLeaderboard();
  const selfId = OnlineClient.getParticipantId();

  // The confirmations opened from here (end game, kicking a singer) pause this on their own.
  const { register } = useKeyboardNav();

  if (resumeCountdownEndsAt !== null) {
    return <CountdownOverlay endsAtServerTime={resumeCountdownEndsAt} label="Resuming in" />;
  }

  const endGame = () => {
    OnlineClient.send.room.endGame();
  };

  const connected = participants.filter((participant) => participant.connected);

  return (
    <Modal open>
      <KeyboardNavContext value={register}>
        <Menu data-test="online-pause-overlay">
          <Menu.Header>
            {pause.reason === 'buffering' ? `Paused — ${pause.name}'s video is buffering` : `Paused by ${pause.name}`}
          </Menu.Header>
          {/* The same singer rows as the lobby, at the density a menu with settings under it allows */}
          <div className="flex flex-col gap-1">
            {connected.map((participant) => (
              <ParticipantSlot
                key={participant.id}
                data-test={`online-pause-player-${participant.playerNumber}`}
                size="compact"
                participant={participant}
                selfId={selfId}
                hostId={hostId}
                showTags
                showColorDot
                canKick>
                <span className="text-active text-sm [font-variant-numeric:tabular-nums]">
                  {formatScore(leaderboard.find((entry) => entry.participantId === participant.id)?.score ?? 0)}
                </span>
              </ParticipantSlot>
            ))}
          </div>
          <Menu.Divider />
          {/* Mic selection + input lag, adjustable mid-game like in the local pause menu */}
          <InGameMicSwitcher />
          <InGameInputLag />
          <Menu.Divider />
          <PauseButton name="online-resume-button" onClick={onResume} isDefault>
            Resume song
          </PauseButton>
          {isHost && (
            <ConfirmModal
              title="End the game?"
              description="This stops the song for everyone and shows the results."
              onConfirm={endGame}
              dataTestPrefix="online-end-game-confirm"
              cancelButton={<ConfirmModal.CancelButton name="keep-singing">Keep singing</ConfirmModal.CancelButton>}
              confirmButton={<ConfirmModal.ConfirmButton name="confirm-end-game">End game</ConfirmModal.ConfirmButton>}>
              {(openEndGameConfirm) => (
                <PauseButton name="online-end-game-button" onClick={openEndGameConfirm} size="small">
                  End game for everyone
                </PauseButton>
              )}
            </ConfirmModal>
          )}
        </Menu>
      </KeyboardNavContext>
    </Modal>
  );
}

export default PauseOverlay;
