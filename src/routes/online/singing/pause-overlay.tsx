import { useState } from 'react';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { useOnlineLeaderboard, useOnlinePlayersStats } from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant, OnlinePauseState } from '~/modules/online/protocol/types';
import ParticipantStatsRow from '~/routes/online/components/participant-stats-row';
import CountdownOverlay from '~/routes/online/singing/countdown-overlay';

interface Props {
  pause: OnlinePauseState;
  resumeCountdownEndsAt: number | null;
  onResume: () => void;
  isHost: boolean;
  hostId: string | null;
  participants: OnlineParticipant[];
}

const Tag = ({ children }: { children: string }) => (
  <span className="bg-active text-default relative rounded-full px-2 text-xs">{children}</span>
);

function PauseOverlay({ pause, resumeCountdownEndsAt, onResume, isHost, hostId, participants }: Props) {
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<OnlineParticipant | null>(null);
  const leaderboard = useOnlineLeaderboard();
  const stats = useOnlinePlayersStats();
  const selfId = OnlineClient.getParticipantId();
  const modalOpen = confirmEndOpen || kickTarget !== null;

  const { register } = useKeyboardNav({ enabled: !modalOpen });

  if (resumeCountdownEndsAt !== null) {
    return <CountdownOverlay endsAtServerTime={resumeCountdownEndsAt} label="Resuming in" />;
  }

  const endGame = () => {
    setConfirmEndOpen(false);
    void OnlineClient.rpc.room.endGame().catch(() => undefined);
  };

  const kick = () => {
    if (kickTarget) {
      void OnlineClient.rpc.room.kickPlayer(kickTarget.id).catch(() => undefined);
    }
    setKickTarget(null);
  };

  const connected = participants.filter((participant) => participant.connected);

  return (
    <Modal open>
      <Menu data-test="online-pause-overlay">
        <Menu.Header>
          {pause.reason === 'buffering' ? `Paused — ${pause.name}'s video is buffering` : `Paused by ${pause.name}`}
        </Menu.Header>
        <div className="flex flex-col gap-1">
          {connected.map((participant) => {
            const score = leaderboard.find((entry) => entry.participantId === participant.id)?.score ?? 0;
            return (
              <ParticipantStatsRow
                key={participant.id}
                participant={participant}
                stats={stats[participant.id]}
                data-test={`online-pause-player-${participant.playerNumber}`}>
                {participant.id === hostId && <Tag>host</Tag>}
                <span className="text-active relative ml-2 text-sm [font-variant-numeric:tabular-nums]">
                  {Math.max(0, Math.floor(score)).toLocaleString('en')}
                </span>
                {isHost && participant.id !== selfId && (
                  <button
                    type="button"
                    onClick={() => setKickTarget(participant)}
                    className="relative text-sm opacity-75 hover:text-red-400 hover:opacity-100"
                    data-test={`online-kick-${participant.playerNumber}`}>
                    ✕
                  </button>
                )}
              </ParticipantStatsRow>
            );
          })}
        </div>
        <Menu.Divider />
        <MenuButton {...register('online-resume-button', onResume)} data-test="online-resume-button">
          Resume song
        </MenuButton>
        {isHost && (
          <MenuButton
            {...register('online-end-game-button', () => setConfirmEndOpen(true))}
            size="small"
            data-test="online-end-game-button">
            End game for everyone
          </MenuButton>
        )}
      </Menu>
      <ConfirmModal
        open={confirmEndOpen}
        onClose={() => setConfirmEndOpen(false)}
        title="End the game?"
        description="This stops the song for everyone and shows the results."
        cancelLabel="Keep singing"
        confirmLabel="End game"
        dataTestPrefix="online-end-game-confirm"
        cancelButtonProps={{ onClick: () => setConfirmEndOpen(false) }}
        confirmButtonProps={{ onClick: endGame }}
      />
      <ConfirmModal
        open={kickTarget !== null}
        onClose={() => setKickTarget(null)}
        title={`Remove ${kickTarget?.name}?`}
        description="They will be removed from the room and won't be able to rejoin."
        cancelLabel="Cancel"
        confirmLabel="Remove"
        dataTestPrefix="online-kick-confirm"
        cancelButtonProps={{ onClick: () => setKickTarget(null) }}
        confirmButtonProps={{ onClick: kick }}
      />
    </Modal>
  );
}

export default PauseOverlay;
