import { styled } from '@linaria/react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { buttonFocused } from 'modules/Elements/Button';
import { focused, typography } from 'modules/Elements/cssMixins';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { memo, useState } from 'react';
import PlayerChangeModal from 'routes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from 'routes/RemoteMic/Components/PlayerNumberCircle';

interface Props {
  playerNumber: 0 | 1 | 2 | 3 | null;
}

export default memo(function PlayerChange({ playerNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  const joined = playerNumber !== null;

  return (
    <>
      <PlayerChangeContainer onClick={() => setIsOpen(true)} data-test="change-player" data-joined={joined}>
        {!joined ? (
          'Join game'
        ) : (
          <>
            <PlayerNumberCircle number={playerNumber} /> Change
          </>
        )}{' '}
        <SwapHorizIcon />
      </PlayerChangeContainer>
      {isOpen && (
        <PlayerChangeModal id={RemoteMicClient.getClientId()!} playerNumber={playerNumber} onModalClose={closeModal} />
      )}
    </>
  );
});

const PlayerChangeContainer = styled.button`
  position: absolute;
  z-index: 1;
  color: white;
  right: 1rem;
  bottom: 1rem;
  padding: 1rem;
  font-size: 2rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: none;
  ${typography};
  background: rgba(0, 0, 0, 0.75);

  &[data-joined='false'] {
    font-size: 3rem;
    padding: 3rem;
    ${focused};
  }

  :hover {
    ${focused};
  }

  :active {
    ${buttonFocused};
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
`;
