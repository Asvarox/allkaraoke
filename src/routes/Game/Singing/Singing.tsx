import { useEffect, useRef, useState } from 'react';
import { GAME_MODE, SingSetup, SongPreview } from '~/interfaces';
import { Calibration } from '~/modules/Calibration/Calibration';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import Modal from '~/modules/Elements/Modal';
import { VideoState } from '~/modules/Elements/VideoPlayer';
import GameState from '~/modules/GameEngine/GameState/GameState';
import events from '~/modules/GameEvents/GameEvents';
import PlayersManager from '~/modules/Players/PlayersManager';
import useSong from '~/modules/Songs/hooks/useSong';
import useBlockScroll from '~/modules/hooks/useBlockScroll';
import useFullscreen from '~/modules/hooks/useFullscreen';
import useViewportSize from '~/modules/hooks/useViewportSize';
import { CalibrationIntro } from '~/routes/Game/Singing/CalibrationIntro';
import WaitForReadiness from '~/routes/Game/Singing/WaitForReadiness';
import LayoutGame from '~/routes/LayoutGame';
import { IsCalibratedSetting, useSettingValue } from '~/routes/Settings/SettingsState';
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
  const [isCalibrated, setIsCalibrated] = useSettingValue(IsCalibratedSetting);

  const { width, height } = useViewportSize();
  const [isEnded, setIsEnded] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [showCalibrationIntro, setShowCalibrationIntro] = useState(true);
  const [playerState, setPlayerState] = useState(VideoState.UNSTARTED);

  const [isTransitionTimeout, setIsTransitionTimeout] = useState(false);

  useBackground(!isTransitionTimeout);

  const showCalibration = !isCalibrated;
  useEffect(() => {
    if (
      !showCalibration &&
      isOverlayVisible &&
      song.data &&
      (isTransitionTimeout || playerState !== VideoState.UNSTARTED)
    ) {
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
      <LayoutGame>
        <div className="relative">
          <div
            className={`pointer-events-none fixed inset-0 z-10 flex h-full w-full flex-col items-stretch px-10 py-10 transition-opacity duration-500 [view-transition-name:song-preview] ${
              isOverlayVisible ? 'opacity-100' : 'opacity-0'
            }`}
            data-test="background-container">
            <div
              className="absolute inset-0 scale-105 bg-black bg-cover bg-center blur-[10px]"
              style={{
                backgroundImage: `url('https://i3.ytimg.com/vi/${songPreview.video}/hqdefault.jpg')`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            />
            <span
              className="typography text-2xl [view-transition-name:song-preview-artist] 2xl:text-3xl"
              data-test="song-artist">
              {songPreview.artist}
            </span>
            <span
              className="typography text-active text-3xl [view-transition-name:song-preview-title] 2xl:text-5xl"
              data-test="song-title">
              {songPreview.title}
            </span>
            <Modal open={showCalibration}>
              {showCalibration && (
                <Menu>
                  {showCalibrationIntro ? (
                    <CalibrationIntro onContinue={() => setShowCalibrationIntro(false)} />
                  ) : (
                    <Calibration onSave={() => setIsCalibrated(true)} />
                  )}
                </Menu>
              )}
            </Modal>
            {!showCalibration && (
              <WaitForReadiness
                onFinish={() => {
                  setIsTransitionTimeout(true);
                  player.current?.play();
                }}
              />
            )}
          </div>
          {song.data && !showCalibration && (
            <Player
              pauseMenu
              ref={player}
              onStatusChange={setPlayerState}
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
                const progress = GameState.getSongCompletionProgress();
                events.songEnded.dispatch(song.data!, singSetup, scores, progress);
                setIsEnded(true);
              }}
              singSetup={singSetup}
              restartSong={restartSong}
            />
          )}
        </div>
      </LayoutGame>
    );
  }
}

export default Singing;
