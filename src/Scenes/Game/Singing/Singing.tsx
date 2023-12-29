import styled from '@emotion/styled';
import { useBackground } from 'Elements/LayoutWithBackground';
import { VideoState } from 'Elements/VideoPlayer';
import events from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import WaitForReadiness from 'Scenes/Game/Singing/WaitForReadiness';
import {
  SongListEntryDetailsArtist,
  SongListEntryDetailsTitle,
} from 'Scenes/SingASong/SongSelection/Components/SongCard';
import useSong from 'Songs/hooks/useSong';
import useBlockScroll from 'hooks/useBlockScroll';
import useFullscreen from 'hooks/useFullscreen';
import { GAME_MODE, SingSetup, SongPreview } from 'interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import useViewportSize from '../../../hooks/useViewportSize';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player, { PlayerRef } from './Player';
import PostGame from './PostGame/PostGame';

interface Props {
  singSetup: SingSetup;
  songPreview: SongPreview;
  returnToSongSelection: () => void;
  restartSong: () => void;
}
function Singing({ songPreview, singSetup, returnToSongSelection, restartSong }: Props) {
  useFullscreen();
  useBlockScroll();
  const player = useRef<PlayerRef | null>(null);
  const song = useSong(songPreview.id);

  const { width, height } = useViewportSize();
  const [isEnded, setIsEnded] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [playerState, setPlayerState] = useState(VideoState.UNSTARTED);

  const playerChanges = useMemo(() => {
    if (!song.data) return [];
    if (singSetup.mode !== GAME_MODE.PASS_THE_MIC) return song.data.tracks.map(() => []);

    return generatePlayerChanges(song.data);
  }, [song.data, singSetup]);

  const [isTransitionTimeout, setIsTransitionTimeout] = useState(false);

  useBackground(!isTransitionTimeout);

  useEffect(() => {
    if (isOverlayVisible && song.data && (isTransitionTimeout || playerState !== VideoState.UNSTARTED)) {
      setIsOverlayVisible(false);
    }
  }, [song.data, isTransitionTimeout, playerState, isOverlayVisible]);

  if (isEnded && song.data) {
    return (
      <PostGame
        width={width}
        height={height}
        song={song.data}
        onClickSongSelection={returnToSongSelection}
        singSetup={singSetup}
      />
    );
  } else {
    return (
      <Container>
        <BackgroundContainer visible={isOverlayVisible}>
          <Overlay video={songPreview.video} width={width} height={height} />
          <Artist>{songPreview.artist}</Artist>
          <Title>{songPreview.title}</Title>
          <WaitForReadiness
            onFinish={() => {
              setIsTransitionTimeout(true);
              player.current?.play();
            }}
          />
        </BackgroundContainer>
        {song.data && (
          <Player
            ref={player}
            onStatusChange={setPlayerState}
            playerChanges={playerChanges}
            players={singSetup.players}
            song={song.data}
            width={width}
            height={height}
            autoplay={false}
            onSongEnd={() => {
              const scores =
                GameState.getSingSetup()?.mode === GAME_MODE.CO_OP
                  ? [
                      {
                        name: PlayersManager.getPlayers()
                          .map((player) => player.getName())
                          .join(', '),
                        score: GameState.getPlayerScore(0),
                      },
                    ]
                  : PlayersManager.getPlayers().map((player) => ({
                      name: player.getName(),
                      score: GameState.getPlayerScore(player.number),
                    }));
              events.songEnded.dispatch(song.data!, singSetup, scores);
              setIsEnded(true);
            }}
            singSetup={singSetup}
            restartSong={restartSong}
          />
        )}
      </Container>
    );
  }
}

const Container = styled.div`
  position: relative;
`;

const BackgroundContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
  background-color: black;
  view-transition-name: song-preview;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: 500ms;
`;

const BaseOverlay = styled.div`
  background-size: cover;
  background-position: center center;
  filter: blur(10px);
`;

const Overlay = (props: { video: string; width: number; height: number }) => (
  <BaseOverlay
    style={{
      backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
      width: `${props.width}px`,
      height: `${props.height}px`,
    }}
  />
);

const Artist = styled(SongListEntryDetailsArtist)`
  view-transition-name: song-preview-artist;
  position: absolute;
  top: 10rem;
  left: 10rem;
  font-size: 7rem;
`;
const Title = styled(SongListEntryDetailsTitle)`
  view-transition-name: song-preview-title;
  position: absolute;

  font-size: 8rem;
  top: 19rem;
  left: 10rem;
`;

export default Singing;
