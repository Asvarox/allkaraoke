import { Icon } from '~/modules/elements/akui/icon';
import { useOnlineRoomState } from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import ParticipantSlot from '~/routes/online/components/participant-slot';

/** Shown to the host in the song preview instead of the mic check — the same mic-check rows the
 * local game uses, driven by each singer's remotely reported volume, plus their thumbs up/down. */
function OnlineSongPlayersPanel() {
  const roomState = useOnlineRoomState();
  const selfId = OnlineClient.getParticipantId();

  const connected = roomState?.participants.filter((participant) => participant.connected) ?? [];

  return (
    <div className="flex flex-col gap-3" data-test="online-song-players-panel">
      {connected.map((participant) => (
        <ParticipantSlot
          key={participant.id}
          data-test={`online-song-player-${participant.playerNumber}`}
          participant={participant}
          selfId={selfId}
          showVote
        />
      ))}
      <span className="typography flex items-center gap-1 text-sm opacity-75">
        They can react with
        <Icon icon="ic:baseline-thumb-up" size={4} />/<Icon icon="ic:baseline-thumb-down" size={4} /> to the song
        you&#39;re browsing.
      </span>
    </div>
  );
}

export default OnlineSongPlayersPanel;
