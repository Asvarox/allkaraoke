import {
  useOnlinePlayersStats,
  useOnlineRoomState,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import ParticipantStatsRow from '~/routes/online/components/participant-stats-row';

/** Shown to the host in the song preview instead of the mic check: the connected singers
 * (with live volume/ping) and their thumbs up/down for the song the host is looking at. */
function OnlineSongPlayersPanel() {
  const roomState = useOnlineRoomState();
  const votes = useOnlineSongVotes();
  const preview = useOnlineSongPreview();
  const stats = useOnlinePlayersStats();

  const connected = roomState?.participants.filter((participant) => participant.connected) ?? [];

  return (
    <div className="flex flex-col gap-2" data-test="online-song-players-panel">
      <span className="typography text-lg">Singers in the room</span>
      {connected.map((participant) => {
        const vote = votes[participant.id];
        const voteForThisSong = vote && vote.songId === preview?.songId ? vote.vote : null;
        return (
          <ParticipantStatsRow
            key={participant.id}
            participant={participant}
            stats={stats[participant.id]}
            data-test={`online-song-player-${participant.playerNumber}`}
            data-vote={voteForThisSong ?? 'none'}>
            {voteForThisSong && <span className="relative text-xl">{voteForThisSong === 'up' ? '👍' : '👎'}</span>}
          </ParticipantStatsRow>
        );
      })}
      <span className="typography text-sm opacity-75">They can react 👍/👎 to the song you&#39;re browsing.</span>
    </div>
  );
}

export default OnlineSongPlayersPanel;
