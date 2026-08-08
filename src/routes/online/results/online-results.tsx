import { useMemo } from 'react';

import { DetailedScore, GAME_MODE, SingSetup, Song } from '~/interfaces';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import PostGameView, { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import LayoutGame from '~/routes/layout-game';

interface Props {
  roomState: OnlineRoomState;
  song: Song;
}

/** Animated result breakdown from the final room snapshots. No high-score step —
 * online games are not persisted to local high scores. */
function OnlineResults({ roomState, song }: Props) {
  const { width, height } = useViewportSize();

  const singSetup = useMemo<SingSetup>(
    () => ({
      id: `online-${roomState.roomCode}-${roomState.chart?.hash ?? 'song'}`,
      players: (roomState.finalResults ?? []).map((result) => ({ number: result.playerNumber, track: 0 })),
      mode: GAME_MODE.DUEL,
      tolerance: roomState.tolerance,
    }),
    [roomState.roomCode, roomState.chart?.hash, roomState.tolerance, roomState.finalResults],
  );

  const players = useMemo<PlayerScore[]>(
    () =>
      (roomState.finalResults ?? []).map((result) => ({
        name: result.name,
        playerNumber: result.playerNumber,
        detailedScore: result.detailedScore as [DetailedScore, DetailedScore],
      })),
    [roomState.finalResults],
  );

  return (
    <LayoutGame>
      <PostGameView
        song={song}
        width={width}
        height={height}
        onClickSongSelection={() => void OnlineClient.rpc.room.returnToLobby().catch(() => undefined)}
        players={players}
        singSetup={singSetup}
        highScores={[]}
        highScoresEnabled={false}
        cameraEnabled={false}
        data-test="online-results"
      />
    </LayoutGame>
  );
}

export default OnlineResults;
