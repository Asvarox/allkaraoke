import styled from '@emotion/styled';
import { GAME_MODE, SingSetup, SongPreview } from 'interfaces';
import { Calibration } from 'modules/Calibration/Calibration';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import Modal from 'modules/Elements/Modal';
import { VideoState } from 'modules/Elements/VideoPlayer';
import GameState from 'modules/GameEngine/GameState/GameState';
import events from 'modules/GameEvents/GameEvents';
import PlayersManager from 'modules/Players/PlayersManager';
import useSong from 'modules/Songs/hooks/useSong';
import useBlockScroll from 'modules/hooks/useBlockScroll';
import useFullscreen from 'modules/hooks/useFullscreen';
import useViewportSize from 'modules/hooks/useViewportSize';
import isE2E from 'modules/utils/isE2E';
import { useEffect, useRef, useState } from 'react';
import { CalibrationIntro } from 'routes/Game/Singing/CalibrationIntro';
import WaitForReadiness from 'routes/Game/Singing/WaitForReadiness';
import LayoutGame from 'routes/LayoutGame';
import { IsCalibratedSetting, useSettingValue } from 'routes/Settings/SettingsState';
import {
  SongListEntryDetailsArtist,
  SongListEntryDetailsTitle,
} from 'routes/SingASong/SongSelection/Components/SongCard';
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

  const showCalibration = !isCalibrated && !isE2E();
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
        <Container>
          <BackgroundContainer visible={isOverlayVisible} data-test="background-container">
            <Overlay video={songPreview.video} width={width} height={height} />
            <Artist data-test="song-artist">{songPreview.artist}</Artist>
            <Title data-test="song-title">{songPreview.title}</Title>
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
          </BackgroundContainer>
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
        </Container>
      </LayoutGame>
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
