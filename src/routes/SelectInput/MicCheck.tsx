import styled from '@emotion/styled';
import { PlayerMicCheck } from '~/modules/Elements/VolumeIndicator';
import PlayersManager from '~/modules/Players/PlayersManager';

interface Props {
  names?: string[];
}

function MicCheck({ names }: Props) {
  return (
    <MicCheckContainer>
      {PlayersManager.getPlayers().map((player) => (
        <Indicator data-test={`mic-check-p${player.number}`} key={player.number}>
          <PlayerMicCheck playerNumber={player.number} />
          <span className="ph-no-capture">{names?.[player.number] ?? player.getName()}</span>
        </Indicator>
      ))}
    </MicCheckContainer>
  );
}

const MicCheckContainer = styled.div`
  display: flex;
  gap: 1.25rem;

  div {
    flex: 1;
  }
`;

const Indicator = styled.div`
  position: relative;
  border: 0.1rem solid white;
  padding: 1rem 3rem;
  background: black;

  text-align: center;
  gap: 1.25rem;
  font-size: 2.3rem;
  color: white;
`;

export default MicCheck;
