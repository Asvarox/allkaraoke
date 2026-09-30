import { ComponentProps } from 'react';

import { useOnlinePlayersStats, useOnlineSongPreview, useOnlineSongVotes } from '~/modules/online/client/hooks';
import { OnlineParticipant, SongVote } from '~/modules/online/protocol/types';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

/** A singer's thumbs up/down, but only while it still applies to the song on screen — votes are kept
 * per song, so one left over from a previously browsed song must not leak into a row. */
function useParticipantVote(participantId: string): SongVote | null {
  const votes = useOnlineSongVotes();
  const preview = useOnlineSongPreview();
  const vote = votes[participantId];

  return vote && vote.songId === preview?.songId ? vote.vote : null;
}

/** What a singer's row reads about them beyond the participant: reported stats, vote and volume. */
export function useParticipantLive(participant: OnlineParticipant, selfId: string) {
  const stats = useOnlinePlayersStats();
  const vote = useParticipantVote(participant.id);

  const isSelf = participant.id === selfId;
  // Away from the keyboard or on another tab: they stopped reporting, so their last volume and ping
  // are frozen rather than current. Never applies to the own row, which reads the mic locally.
  const isIdle = !isSelf && (stats[participant.id]?.idle ?? false);
  // The own volume comes straight from the local mic pipeline (no re-render per frame);
  // everyone else's is the level they report to the room.
  const volume: ComponentProps<typeof MicCheckSlotShell>['volume'] = isSelf
    ? { type: 'local' }
    : { type: 'remote', volume: isIdle ? 0 : (stats[participant.id]?.volume ?? 0) };

  return { stats: stats[participant.id], vote, isSelf, isIdle, volume };
}
