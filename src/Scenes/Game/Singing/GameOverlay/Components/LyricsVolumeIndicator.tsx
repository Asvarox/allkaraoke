import styled from '@emotion/styled';
import { VolumeIndicator } from 'Elements/VolumeIndicator';
import { PlayerEntity } from 'Players/PlayersManager';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import Ping from 'Scenes/SingASong/SongSelection/Components/SongSettings/MicCheck/Ping';
import PlayerStatus from 'Scenes/SingASong/SongSelection/Components/SongSettings/MicCheck/Status';
import usePlayerMicStatus from 'hooks/players/usePlayerMicStatus';

interface Props {
  player: PlayerEntity;
  bottom?: boolean;
}

function LyricsVolumeIndicator({ player, bottom = false }: Props) {
  const playerVolume = InputManager.getPlayerVolume(player.number);
  const status = usePlayerMicStatus(player.number);

  return (
    <Container>
      {status !== 'unavailable' && <VolumeIndicator playerNumber={player.number} volume={playerVolume} />}
      <StyledPlayerStatus status={status} tooltipPosition="start" />
      <StyledPing playerNumber={player.number} />
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  width: 20rem;
  right: 0;
  top: 0;
  height: 100%;
`;

const StyledPlayerStatus = styled(PlayerStatus)`
  top: auto;
  right: 1rem;
  bottom: 1rem;
`;
const StyledPing = styled(Ping)`
  z-index: 2;
  font-size: 2rem;
  margin-right: 1rem;
  -webkit-text-stroke: 0.1rem black;
  bottom: 1.5rem;
`;

export default LyricsVolumeIndicator;
