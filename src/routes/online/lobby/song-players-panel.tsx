import { useMemo } from 'react';
import tinycolor from 'tinycolor2';

import Box from '~/modules/elements/akui/primitives/box';
import styles from '~/modules/game-engine/drawing/styles';
import {
  useOnlinePlayersStats,
  useOnlineRoomState,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import { OnlineParticipant, PlayerStats } from '~/modules/online/protocol/types';

/** Volume bar matching PlayerMicCheck's look, but driven by the remotely reported volume. */
function RemoteMicCheck({ participant, stats }: { participant: OnlineParticipant; stats?: PlayerStats }) {
  const color = useMemo(() => {
    const rgb = tinycolor(styles.colors.players[participant.playerNumber].text).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [participant.playerNumber]);

  return (
    <div
      className="pointer-events-none absolute top-0 right-0 z-0 h-full w-full origin-right rounded-xl transition-transform duration-150"
      style={{
        transform: `scaleX(${Math.min(1, (stats?.volume ?? 0) * 20)})`,
        background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0) 100%)`,
      }}
      data-test="participant-volume"
    />
  );
}

/** Shown to the host in the song preview instead of the mic check — styled like the local
 * game's mic-check slots, with each singer's live volume and their thumbs up/down. */
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
        return (
          <Box
            key={participant.id}
            data-test={`online-song-player-${participant.playerNumber}`}
            data-vote={voteForThisSong ?? 'none'}
            className="relative flex h-14 w-full items-center gap-5 border border-white px-2 py-2 text-center text-lg text-white">
            <RemoteMicCheck participant={participant} stats={stats[participant.id]} />
            <span className="ph-no-capture absolute inset-0 z-1 flex items-center justify-center">
              {participant.name}
            </span>
            {stats[participant.id] && (
              <span className="z-1 text-xs [font-variant-numeric:tabular-nums] opacity-60">
                {stats[participant.id].ping} ms
              </span>
            )}
            {voteForThisSong && <span className="z-1 ml-auto text-2xl">{voteForThisSong === 'up' ? '👍' : '👎'}</span>}
          </Box>
        );
      })}
      <span className="typography text-sm opacity-75">They can react 👍/👎 to the song you&#39;re browsing.</span>
    </div>
  );
}

export default OnlineSongPlayersPanel;
