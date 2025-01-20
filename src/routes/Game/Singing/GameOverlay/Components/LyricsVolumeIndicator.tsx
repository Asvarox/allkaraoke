import styled from '@emotion/styled';
import { VolumeIndicator } from 'modules/Elements/VolumeIndicator';
import InputManager from 'modules/GameEngine/Input/InputManager';
import { PlayerEntity } from 'modules/Players/PlayersManager';
import usePlayerMicStatus from 'modules/hooks/players/usePlayerMicStatus';
import { ComponentProps } from 'react';
import Ping from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/Ping';
import PlayerStatus from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/Status';

interface Props extends ComponentProps<typeof Container> {
  player: PlayerEntity;
}

function LyricsVolumeIndicator({ player, ...props }: Props) {
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
`;

export default LyricsVolumeIndicator;
