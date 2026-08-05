import { Icon } from '~/modules/elements/akui/icon';
import { Tag } from '~/modules/elements/akui/tag';
import { useOnlinePlayersStats, useOnlineSongPreview, useOnlineSongVotes } from '~/modules/online/client/hooks';
import { OnlineParticipant, OnlineRoomState } from '~/modules/online/protocol/types';
import { PLAYER_NUMBERS } from '~/modules/players/player-number';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

interface Props {
  roomState: OnlineRoomState;
  selfId: string;
  /** Opens the name/color editor for the own row. */
  onEdit?: () => void;
  /** Host only: kick (and ban) another singer — confirmation handled by the caller. */
  onKick?: (participant: OnlineParticipant) => void;
}

const probeLabel: Record<string, string> = {
  pending: 'checking video…',
  playable: 'video ok',
  failed: 'video failed',
};

/** The room's singers, using the same rows as the local mic check — a player-colored volume bar
 * filling in behind the name, with lobby tags (host/ready/…) and actions on the right. */
function ParticipantList({ roomState, selfId, onEdit, onKick }: Props) {
  const isHost = roomState.hostId === selfId;
  const stats = useOnlinePlayersStats();
  const votes = useOnlineSongVotes();
  const preview = useOnlineSongPreview();

  return (
    <div className="flex flex-col gap-3" data-test="online-participant-list">
      {PLAYER_NUMBERS.map((playerNumber) => {
        const participant = roomState.participants.find((p) => p.playerNumber === playerNumber);

        // The room's free seats are shown too, so everyone can see there's still space to join
        if (!participant) {
          return (
            <MicCheckSlotShell
              key={`empty-${playerNumber}`}
              data-test={`online-empty-slot-${playerNumber}`}
              playerNumber={playerNumber}
              name={<span className="text-base">Free slot</span>}
              connected={false}
              volume={{ type: 'none' }}
            />
          );
        }

        const isSelf = participant.id === selfId;
        const participantStats = stats[participant.id];
        const vote = votes[participant.id];
        const voteForThisSong = vote && vote.songId === preview?.songId ? vote.vote : null;

        return (
          <MicCheckSlotShell
            key={participant.id}
            data-test={`online-participant-${participant.playerNumber}`}
            data-ready={participant.ready}
            data-connected={participant.connected}
            data-vote={voteForThisSong ?? 'none'}
            playerNumber={participant.playerNumber}
            // Stays centered in the row (the badges are positioned, not in flow); the width cap
            // keeps a long name from running underneath them
            name={
              <span
                className={`max-w-[calc(100%-16rem)] truncate ${participant.connected ? '' : 'line-through opacity-50'}`}>
                {participant.name}
              </span>
            }
            connected={participant.connected}
            // The own volume comes straight from the local mic pipeline (no re-render per frame);
            // everyone else's is the level they report to the room.
            volume={isSelf ? { type: 'local' } : { type: 'remote', volume: participantStats?.volume ?? 0 }}>
            <ParticipantBadges stats={participantStats} vote={voteForThisSong}>
              {isSelf && (
                <Tag className="bg-black text-white" data-test="participant-self">
                  you
                </Tag>
              )}
              {participant.id === roomState.hostId && <Tag data-test="participant-host">host</Tag>}
              {!participant.connected && <Tag>disconnected</Tag>}
              {participant.ready && <Tag data-test="participant-ready">ready</Tag>}
              {probeLabel[participant.probe] && <Tag>{probeLabel[participant.probe]}</Tag>}
              {isSelf && onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  title="Change your name or color"
                  className="hover:text-active flex cursor-pointer items-center opacity-75 hover:opacity-100"
                  data-test="customize-button">
                  <Icon icon="ic:baseline-edit" className="h-5 w-5" />
                </button>
              )}
              {isHost && !isSelf && onKick && (
                <button
                  type="button"
                  onClick={() => onKick(participant)}
                  title={`Remove ${participant.name} from the room`}
                  className="flex cursor-pointer items-center opacity-75 hover:text-red-400 hover:opacity-100"
                  data-test={`online-kick-${participant.playerNumber}`}>
                  <Icon icon="ic:baseline-close" className="h-5 w-5" />
                </button>
              )}
            </ParticipantBadges>
          </MicCheckSlotShell>
        );
      })}
    </div>
  );
}

export default ParticipantList;
