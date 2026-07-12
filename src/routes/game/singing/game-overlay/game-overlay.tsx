import { forwardRef, MutableRefObject, useEffect, useImperativeHandle, useRef } from 'react';
import { GAME_MODE, PlayerSetup, Song } from '~/interfaces';
import { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import PlayersManager from '~/modules/players/players-manager';
import SkipIntro from '~/routes/game/singing/game-overlay/components/skip-intro';
import SkipOutro from '~/routes/game/singing/game-overlay/components/skip-outro';
import { GraphicSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';
import GameState from '../../../../modules/game-engine/game-state/game-state';
import DurationBar from './components/duration-bar';
import Lyrics from './components/lyrics';
import ScoreText from './components/score-text';

import CanvasDrawing from '~/modules/game-engine/drawing/index';
import fragShader from '~/modules/game-engine/drawing/shaders/shader.frag?raw';
import vertShader from '~/modules/game-engine/drawing/shaders/shader.vert?raw';
import tuple from '~/modules/utils/tuple';
import getPlayerScoreData from '~/routes/game/singing/game-overlay/helpers/get-player-score-data';

interface Props {
  song: Song;
  currentStatus: VideoState;
  width: number;
  height: number;
  onSongEnd?: () => void;
  playerSetups: PlayerSetup[];
  duration: number;
  effectsEnabled: boolean;
  videoPlayerRef: MutableRefObject<VideoPlayerRef | null>;
  isPauseMenuVisible: boolean;
}

const MAX_RENDER_RESOLUTION_W = 1920;

const GameOverlay = forwardRef(function (
  {
    currentStatus,
    width,
    height,
    playerSetups,
    onSongEnd,
    effectsEnabled,
    videoPlayerRef,
    isPauseMenuVisible,
    duration,
  }: Props,
  fRef,
) {
  'use no memo'; // React Compiler: reads GameState/PlayersManager mutable singletons directly during render (getPlayerScore, getSingSetup, getPlayers), so the compiler can cache stale JSX (e.g. the score display never updating).
  const [graphicLevel] = useSettingValue(GraphicSetting);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const drawer = useRef<CanvasDrawing | null>(null);
  const lyrics = useRef<HTMLDivElement | null>(null);

  const overlayWidth = MAX_RENDER_RESOLUTION_W;
  const overlayHeight = overlayWidth * (height / width);

  const overlayScaleFactor = overlayHeight / height;

  useImperativeHandle(fRef, () => {
    return {
      pause: () => drawer.current?.pause(),
      resume: () => drawer.current?.resume(),
    };
  }, []);

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
  }, [overlayScaleFactor]);

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
  const showMultipleLines = !mobilePhoneMode && players.length > 1;

  return (
    <div className="relative flex h-full flex-col font-bold text-white">
      {graphicLevel === 'high' && (
        <>
          <script type={'x-shader/x-fragment'} id={'plane-fs'}>
            {fragShader}
          </script>
          <script id="plane-vs" type="x-shader/x-vertex">
            {vertShader}
          </script>
          <div id="canvas" className="absolute inset-0 z-[10000] h-full w-full" />
        </>
      )}
      <div id="plane" className="absolute inset-0 h-full w-full" style={!effectsEnabled ? { opacity: 0 } : undefined}>
        <canvas
          ref={canvas}
          width={overlayWidth}
          height={overlayHeight}
          data-sampler="planeTexture"
          className="h-full w-full"
        />
      </div>
      {effectsEnabled && (
        <>
          <SkipIntro playerRef={videoPlayerRef} isEnabled={!isPauseMenuVisible} />
          <SkipOutro onSongEnd={onSongEnd} isEnabled={!isPauseMenuVisible} />
        </>
      )}
      <DurationBar players={playerSetups} currentStatus={currentStatus} duration={duration} />
      <div className="py-5">
        {showMultipleLines && (
          <Lyrics player={players[0]} effectsEnabled={effectsEnabled} showStatusForAllPlayers={players.length > 2} />
        )}
      </div>
      <div className="mobile:text-xl stroke-text z-10 flex h-full flex-1 flex-col justify-around pr-4 text-right text-3xl">
        {effectsEnabled && (
          <>
            {GameState.getSingSetup()?.mode === GAME_MODE.CO_OP ? (
              <span data-test="players-score" data-score={Math.floor(GameState.getPlayerScore(0))}>
                <ScoreText score={GameState.getPlayerScore(0)} />
              </span>
            ) : (
              PlayersManager.getPlayers().map((player) => {
                const scores = PlayersManager.getPlayers().map((player) =>
                  tuple([player.number, GameState.getPlayerScore(player.number)]),
                );
                const { score, isFirst } = getPlayerScoreData(scores, player.number);

                return (
                  <span
                    className="typography relative"
                    key={player.number}
                    data-test={`player-${player.number}-score`}
                    data-score={Math.floor(score)}>
                    <ScoreText score={score} />
                    <div
                      className={`mobile:top-6 mobile:text-lg absolute top-10 rotate-12 text-xl transition-all duration-200 ${isFirst ? '-right-2' : '-right-36'}`}>
                      {isFirst ? <div className="motion-preset-pulse-sm opacity-75">🥇</div> : '🥇'}
                    </div>
                  </span>
                );
              })
            )}
          </>
        )}
      </div>
      <div className="py-5" ref={lyrics}>
        <Lyrics
          showStatusForAllPlayers={players.length > 2}
          player={players.length > 2 ? players[0] : players.at(-1)!}
          bottom
          effectsEnabled={effectsEnabled}
        />
      </div>
    </div>
  );
});

export default GameOverlay;
