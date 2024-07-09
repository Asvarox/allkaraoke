import { styled } from '@linaria/react';
import { GAME_MODE, PlayerSetup, Song } from 'interfaces';
import { VideoPlayerRef, VideoState } from 'modules/Elements/VideoPlayer';
import PlayersManager from 'modules/Players/PlayersManager';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import SkipIntro from 'routes/Game/Singing/GameOverlay/Components/SkipIntro';
import SkipOutro from 'routes/Game/Singing/GameOverlay/Components/SkipOutro';
import { GraphicSetting, MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';
import GameState from '../../../../modules/GameEngine/GameState/GameState';
import DurationBar from './Components/DurationBar';
import Lyrics from './Components/Lyrics';
import ScoreText from './Components/ScoreText';

import CanvasDrawing from 'modules/GameEngine/Drawing';
import fragShader from 'modules/GameEngine/Drawing/Shaders/shader.frag?raw';
import vertShader from 'modules/GameEngine/Drawing/Shaders/shader.vert?raw';

interface Props {
  song: Song;
  currentStatus: VideoState;
  width: number;
  height: number;
  onSongEnd: () => void;
  playerSetups: PlayerSetup[];
  duration: number;
  effectsEnabled: boolean;
  videoPlayerRef: VideoPlayerRef | null;
  isPauseMenuVisible: boolean;
}

const MAX_RENDER_RESOLUTION_W = 1920;

const GameOverlay = forwardRef(function (
  { currentStatus, width, height, playerSetups, onSongEnd, effectsEnabled, videoPlayerRef, isPauseMenuVisible }: Props,
  fRef,
) {
  const [graphicLevel] = useSettingValue(GraphicSetting);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const drawer = useRef<CanvasDrawing | null>(null);
  const lyrics = useRef<HTMLDivElement | null>(null);

  const overlayWidth = MAX_RENDER_RESOLUTION_W;
  const overlayHeight = overlayWidth * (height / width);

  const overlayScaleFactor = overlayHeight / height;

  useImperativeHandle(
    fRef,
    () => {
      return {
        pause: () => drawer.current?.pause(),
        resume: () => drawer.current?.resume(),
      };
    },
    [drawer.current, lyrics.current?.offsetHeight, overlayScaleFactor],
  );

  useEffect(() => {
    GameState.startInputMonitoring();

    return () => {
      GameState.stopInputMonitoring();
    };
  }, []);

  // const resolutionScaleFactor = overlayWidth / MAX_RENDER_RESOLUTION_W;

  useEffect(() => {
    if (!canvas.current || !lyrics.current) return;

    drawer.current = new CanvasDrawing(
      canvas.current,
      lyrics.current.offsetHeight * overlayScaleFactor,
      // resolutionScaleFactor,
    );
    drawer.current.start();

    return () => {
      drawer.current?.end();
    };
  }, [lyrics.current?.offsetHeight, overlayScaleFactor]);

  useEffect(() => {
    if (isPauseMenuVisible && drawer.current?.isPlaying()) {
      drawer.current?.pause();
    } else if (!isPauseMenuVisible && !drawer.current?.isPlaying()) {
      drawer.current?.resume();
    }
  }, [isPauseMenuVisible]);

  useEffect(() => {
    if (currentStatus === VideoState.ENDED && onSongEnd) {
      onSongEnd();
    }
  }, [currentStatus, onSongEnd]);

  const players = PlayersManager.getPlayers();
  const showMultipleLines = !mobilePhoneMode && players.length === 2;

  return (
    <Screen>
      {graphicLevel === 'high' && (
        <>
          <script type={'x-shader/x-fragment'} id={'plane-fs'}>
            {fragShader}
          </script>
          <script id="plane-vs" type="x-shader/x-vertex">
            {vertShader}
          </script>
          <Curtains id="canvas" style={{ zIndex: 10000 }} />
        </>
      )}
      <GameCanvas id="plane" style={!effectsEnabled ? { opacity: 0 } : undefined}>
        <canvas ref={canvas} width={overlayWidth} height={overlayHeight} data-sampler="planeTexture" />
      </GameCanvas>
      {effectsEnabled && (
        <>
          <SkipIntro playerRef={videoPlayerRef} isEnabled={!isPauseMenuVisible} />
          <SkipOutro onSongEnd={onSongEnd} isEnabled={!isPauseMenuVisible} />
        </>
      )}
      <DurationBar players={playerSetups} />
      <LyricsWrapper>
        {showMultipleLines && (
          <Lyrics player={players[0]} effectsEnabled={effectsEnabled} showMultipleLines={showMultipleLines} />
        )}
      </LyricsWrapper>
      <Scores>
        {effectsEnabled && (
          <>
            {GameState.getSingSetup()?.mode === GAME_MODE.CO_OP ? (
              <Score data-test="players-score" data-score={Math.floor(GameState.getPlayerScore(0))}>
                <ScoreText score={GameState.getPlayerScore(0)} />
              </Score>
            ) : (
              PlayersManager.getPlayers().map((player) => (
                <Score
                  key={player.number}
                  data-test={`player-${player.number}-score`}
                  data-score={Math.floor(GameState.getPlayerScore(player.number))}>
                  <ScoreText score={GameState.getPlayerScore(player.number)} />
                </Score>
              ))
            )}
          </>
        )}
      </Scores>
      <LyricsWrapper ref={lyrics}>
        <Lyrics
          showMultipleLines={showMultipleLines}
          player={players[showMultipleLines ? 1 : 0]}
          bottom
          effectsEnabled={effectsEnabled}
        />
      </LyricsWrapper>
    </Screen>
  );
});

export default GameOverlay;

const LyricsWrapper = styled.div`
  padding: 2rem 0;
  box-sizing: border-box;
`;

const Screen = styled.div`
  height: 100%;
  color: white;
  -webkit-text-stroke: 0.2rem black;
  font-weight: bold;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const GameCanvas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
`;

const Curtains = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Scores = styled.div`
  flex: 1;
  height: 100%;
  box-sizing: border-box;
  font-size: 5.5rem;
  display: flex;
  justify-content: space-around;
  padding-right: 4rem;
  flex-direction: column;
  text-align: right;
  z-index: 1;
`;

const Score = styled.span``;
