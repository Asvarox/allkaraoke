import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ArrowBack,
  ArrowForward,
  Games,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  Shuffle,
} from '@mui/icons-material';
import events from 'GameEvents/GameEvents';
import { useEventListener } from 'GameEvents/hooks';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { keyStrokes } from 'RemoteMic/Network/messages';
import RemoteSongSearch from 'Scenes/RemoteMic/Panels/Microphone/RemoteSongSearch';

interface Props {
  onSearchStateChange?: (isActive: boolean) => void;
}

export default function RemoteMicKeyboard({ onSearchStateChange }: Props) {
  const [keyboard] = useEventListener(events.remoteKeyboardLayout, true) ?? [];

  const isHorizontal = keyboard?.horizontal !== undefined || keyboard?.['horizontal-vertical'] !== undefined;
  const isVertical = keyboard?.vertical !== undefined || keyboard?.['horizontal-vertical'] !== undefined;

  const onPress = (key: keyStrokes) => () => {
    // navigator?.vibrate?.(200);
    RemoteMicClient.sendKeyStroke(key);
  };

  return keyboard !== undefined ? (
    <Container data-test="remote-keyboard">
      {keyboard?.remote?.includes('search') && <RemoteSongSearch onSearchStateChange={onSearchStateChange} />}
      {(isHorizontal || isVertical) && (
        <ActionsContainer>
          <ArrowsContainer>
            <ArrowButton onClick={onPress('up')} disabled={!isVertical} data-test="arrow-up">
              <KeyboardArrowUp />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton onClick={onPress('left')} disabled={!isHorizontal} data-test="arrow-left">
              <KeyboardArrowLeft />
            </ArrowButton>
            <ArrowButton disabled>
              <Games />
            </ArrowButton>
            <ArrowButton onClick={onPress('right')} disabled={!isHorizontal} data-test="arrow-right">
              <KeyboardArrowRight />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton onClick={onPress('down')} disabled={!isVertical} data-test="arrow-down">
              <KeyboardArrowDown />
            </ArrowButton>
          </ArrowsContainer>
        </ActionsContainer>
      )}
      <ActionsContainer>
        <ActionButton onClick={onPress('back')} disabled={keyboard?.back === undefined} data-test="keyboard-backspace">
          {keyboard?.back || (
            <>
              <ArrowBack /> Back
            </>
          )}
        </ActionButton>
        <ActionButton onClick={onPress('accept')} disabled={keyboard?.accept === undefined} data-test="keyboard-enter">
          {keyboard?.accept || (
            <>
              Enter <ArrowForward />
            </>
          )}
        </ActionButton>
      </ActionsContainer>
      <Break />
      <ActionsContainer disabled={keyboard?.shiftR === undefined} data-test="keyboard-shift-r">
        <ActionButton onClick={onPress('random')}>
          <Shuffle /> {keyboard?.shiftR || 'Random Song'}
        </ActionButton>
      </ActionsContainer>
    </Container>
  ) : null;
}

const Container = styled.div`
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;
const ArrowsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  color: white;
  font-size: 2rem;
`;

const ActionsContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  opacity: ${(props) => (props.disabled ? 0 : 1)};
`;

const Break = styled.div`
  flex-basis: 100%;
  height: 0;
`;

const ButtonBase = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  box-sizing: border-box;
  margin: 0.25rem;
  width: 4.5rem;
  height: 4.5rem;

  svg {
    width: 2.5rem;
    height: 2.5rem;
  }

  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

const ArrowButton = styled(ButtonBase)<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.3rem;
  border: 0.3rem solid rgb(204, 204, 204);
  border-bottom-color: rgb(130, 130, 130);
  border-right-color: rgb(130, 130, 130);
  gap: 0.5rem;

  ${(props) =>
    !props.disabled
      ? css`
          cursor: pointer;
          &:active {
            border: 0.3rem solid rgb(130, 130, 130);
            border-bottom-color: rgb(204, 204, 204);
            border-right-color: rgb(204, 204, 204);
          }
        `
      : ''}

  color: rgb(51, 51, 51);
  font-weight: normal;
  font-size: 2.5rem;
  box-shadow:
    0 0.1rem 0 rgba(0, 0, 0, 0.2),
    inset 0 0 0 0.2rem #ffffff;
  background-color: rgb(247, 247, 247);
  text-shadow: 0 0.1rem 0 #fff;
`;

const ActionButton = styled(ArrowButton)<{ disabled?: boolean }>`
  width: 100%;
`;
