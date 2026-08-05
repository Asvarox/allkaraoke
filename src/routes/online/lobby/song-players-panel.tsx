import { Icon } from '~/modules/elements/akui/icon';
import {
  useOnlinePlayersStats,
  useOnlineRoomState,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

/** Shown to the host in the song preview instead of the mic check — the same mic-check rows the
 * local game uses, driven by each singer's remotely reported volume, plus their thumbs up/down. */
function OnlineSongPlayersPanel() {
  const roomState = useOnlineRoomState();
  const votes = useOnlineSongVotes();
  const preview = useOnlineSongPreview();
  const stats = useOnlinePlayersStats();

  const connected = roomState?.participants.filter((participant) => participant.connected) ?? [];

  return (
    <div className="flex flex-col gap-3" data-test="online-song-players-panel">
      {connected.map((participant) => {
        const vote = votes[participant.id];
        const voteForThisSong = vote && vote.songId === preview?.songId ? vote.vote : null;
        const participantStats = stats[participant.id];

        return (
          <MicCheckSlotShell
            key={participant.id}
            data-test={`online-song-player-${participant.playerNumber}`}
            data-vote={voteForThisSong ?? 'none'}
            playerNumber={participant.playerNumber}
            name={participant.name}
            connected
            volume={{ type: 'remote', volume: participantStats?.volume ?? 0 }}>
            <ParticipantBadges stats={participantStats} vote={voteForThisSong} />
          </MicCheckSlotShell>
        );
      })}
      <span className="typography flex items-center gap-1 text-sm opacity-75">
        They can react with
        <Icon icon="ic:baseline-thumb-up" size={4} />/<Icon icon="ic:baseline-thumb-down" size={4} /> to the song
        you&#39;re browsing.
      </span>
    </div>
  );
}

export default OnlineSongPlayersPanel;
