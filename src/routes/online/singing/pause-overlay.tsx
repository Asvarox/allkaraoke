import { ComponentRef, useRef, useState } from 'react';

import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Menu } from '~/modules/elements/akui/menu';
import { Tag } from '~/modules/elements/akui/tag';
import { MenuButton } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { Switcher } from '~/modules/elements/switcher';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { useOnlineLeaderboard, useOnlinePlayersStats } from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant, OnlinePauseState } from '~/modules/online/protocol/types';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import useKickParticipant from '~/routes/online/hooks/use-kick-participant';
import CountdownOverlay from '~/routes/online/singing/countdown-overlay';
import useMicSwitcher from '~/routes/select-input/hooks/use-mic-switcher';
import InputLag from '~/routes/settings/input-lag';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

interface Props {
  pause: OnlinePauseState;
  resumeCountdownEndsAt: number | null;
  onResume: () => void;
  isHost: boolean;
  hostId: string | null;
  participants: OnlineParticipant[];
}

function PauseOverlay({ pause, resumeCountdownEndsAt, onResume, isHost, hostId, participants }: Props) {
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const { isKicking, requestKick, kickModal } = useKickParticipant();
  const leaderboard = useOnlineLeaderboard();
  const stats = useOnlinePlayersStats();
  const selfId = OnlineClient.getParticipantId();
  const modalOpen = confirmEndOpen || isKicking;

  const { register } = useKeyboardNav({ enabled: !modalOpen });

  // Mic selection + input lag, adjustable mid-game like in the local pause menu
  const inputLagRef = useRef<ComponentRef<typeof InputLag>>(null);
  const { selectedMic, cycleMic } = useMicSwitcher();

  if (resumeCountdownEndsAt !== null) {
    return <CountdownOverlay endsAtServerTime={resumeCountdownEndsAt} label="Resuming in" />;
  }

  const endGame = () => {
    setConfirmEndOpen(false);
    void OnlineClient.rpc.room.endGame().catch(() => undefined);
  };

  const connected = participants.filter((participant) => participant.connected);

  return (
    <Modal open>
      <Menu data-test="online-pause-overlay">
        <Menu.Header>
          {pause.reason === 'buffering' ? `Paused — ${pause.name}'s video is buffering` : `Paused by ${pause.name}`}
        </Menu.Header>
        {/* The same singer rows as the lobby, at the density a menu with settings under it allows */}
        <div className="flex flex-col gap-1">
          {connected.map((participant) => {
            const isSelf = participant.id === selfId;
            const score = leaderboard.find((entry) => entry.participantId === participant.id)?.score ?? 0;

            return (
              <MicCheckSlotShell
                key={participant.id}
                data-test={`online-pause-player-${participant.playerNumber}`}
                size="compact"
                playerNumber={participant.playerNumber}
                name={
                  <span className="flex items-center gap-2">
                    <PlayerColorDot playerNumber={participant.playerNumber} />
                    {participant.name}
                  </span>
                }
                connected={participant.connected}
                // The own volume comes straight from the local mic pipeline (no re-render per
                // frame); everyone else's is the level they report to the room.
                volume={isSelf ? { type: 'local' } : { type: 'remote', volume: stats[participant.id]?.volume ?? 0 }}>
                <ParticipantBadges stats={stats[participant.id]}>
                  {participant.id === hostId && <Tag>host</Tag>}
                  <span className="text-active text-sm [font-variant-numeric:tabular-nums]">
                    {Math.max(0, Math.floor(score)).toLocaleString('en')}
                  </span>
                  {isHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => requestKick(participant)}
                      title={`Remove ${participant.name} from the room`}
                      className="flex cursor-pointer items-center text-sm opacity-75 hover:text-red-400 hover:opacity-100"
                      data-test={`online-kick-${participant.playerNumber}`}>
                      ✕
                    </button>
                  )}
                </ParticipantBadges>
              </MicCheckSlotShell>
            );
          })}
        </div>
        <Menu.Divider />
        <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic || '—'} />
        <InputLag ref={inputLagRef} {...register('input-lag', () => inputLagRef.current?.element?.focus())} />
        <Menu.Divider />
        <MenuButton {...register('online-resume-button', onResume, undefined, true)} data-test="online-resume-button">
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
      {kickModal}
    </Modal>
  );
}

export default PauseOverlay;
