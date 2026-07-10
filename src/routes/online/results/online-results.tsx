import { useMemo } from 'react';
import { DetailedScore, GAME_MODE, SingSetup, Song } from '~/interfaces';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import SongPage from '~/routes/game/song-page';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import ResultsView from '~/routes/game/singing/post-game/views/results';
import LayoutGame from '~/routes/layout-game';

interface Props {
  roomState: OnlineRoomState;
  song: Song;
}

/** Animated result breakdown from the final room snapshots. No high-score step —
 * online games are not persisted to local high scores. */
function OnlineResults({ roomState, song }: Props) {
  const { width, height } = useViewportSize();
  useBackgroundMusic(true);

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
      <SongPage songData={song} width={width} height={height}>
        <div className="flex flex-1 flex-col gap-2" data-test="online-results">
          <ResultsView
            onNextStep={() => void OnlineClient.rpc.room.returnToLobby().catch(() => undefined)}
            players={players}
            singSetup={singSetup}
            highScores={[]}
            cameraEnabled={false}
          />
        </div>
      </SongPage>
    </LayoutGame>
  );
}

export default OnlineResults;
