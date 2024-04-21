import styled from '@emotion/styled';
import { VolumeIndicator } from 'Elements/VolumeIndicator';
import { PlayerEntity } from 'Players/PlayersManager';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import Ping from 'Scenes/SingASong/SongSelectionVirtualized/Components/SongSettings/MicCheck/Ping';
import PlayerStatus from 'Scenes/SingASong/SongSelectionVirtualized/Components/SongSettings/MicCheck/Status';
import usePlayerMicStatus from 'hooks/players/usePlayerMicStatus';

interface Props {
  player: PlayerEntity;
  bottom?: boolean;
}

function LyricsVolumeIndicator({ player, bottom = false, ...props }: Props) {
  const playerVolume = InputManager.getPlayerVolume(player.number);
  const status = usePlayerMicStatus(player.number);

  return (
    <Container {...props}>
      {status !== 'unavailable' && <VolumeIndicator playerNumber={player.number} volume={playerVolume} />}
      <StyledPlayerStatus status={status} tooltipPosition="start" />
      <StyledPing playerNumber={player.number} />
    </Container>
  );
}

const Container = styled.div`
  width: 20rem;
  position: relative;
`;

const StyledPlayerStatus = styled(PlayerStatus)`
  top: auto;
  right: 1rem;
  bottom: -0.5rem;
`;
const StyledPing = styled(Ping)`
  z-index: 2;
  font-size: 2rem;
  margin-right: 1rem;
  -webkit-text-stroke: 0.1rem black;
  //bottom: 1rem;
`;

export default LyricsVolumeIndicator;
