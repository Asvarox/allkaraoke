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
import { twc, TwcComponentProps } from 'react-twc';
import { Kbd } from '~/modules/Elements/AKUI/Kbd';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListener } from '~/modules/GameEvents/hooks';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { keyStrokes } from '~/modules/RemoteMic/Network/messages';
import RemoteSongSearch from '~/routes/RemoteMic/Panels/Microphone/RemoteSongSearch';

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
    <div data-test="remote-keyboard" className="flex flex-wrap justify-center gap-4">
      {keyboard?.remote?.includes('search') && <RemoteSongSearch onSearchStateChange={onSearchStateChange} />}
      {(isHorizontal || isVertical) && (
        <ActionsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('up')}
              disabled={!isVertical}
              data-disabled={!isVertical}
              data-test="arrow-up">
              <KeyboardArrowUp />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('left')}
              disabled={!isHorizontal}
              data-disabled={!isHorizontal}
              data-test="arrow-left">
              <KeyboardArrowLeft />
            </ArrowButton>
            <ArrowButton disabled data-disabled>
              <Games />
            </ArrowButton>
            <ArrowButton
              onClick={onPress('right')}
              disabled={!isHorizontal}
              data-disabled={!isHorizontal}
              data-test="arrow-right">
              <KeyboardArrowRight />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('down')}
              disabled={!isVertical}
              data-disabled={!isVertical}
              data-test="arrow-down">
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
      <ActionsContainer $disabled={keyboard?.shiftR === undefined} data-test="keyboard-shift-r">
        <ActionButton onClick={onPress('random')}>
          <Shuffle /> {keyboard?.shiftR || 'Random Song'}
        </ActionButton>
      </ActionsContainer>
    </div>
  ) : null;
}

const ArrowsContainer = twc.div`flex flex-1 justify-center text-xl text-white`;

const ActionsContainer = twc.div<TwcComponentProps<'div'> & { $disabled?: boolean }>((props) => [
  'flex flex-1 flex-col justify-between',
  props.$disabled ? 'opacity-0' : 'opacity-100',
]);

const ArrowButton = twc(Kbd)`m-0.5 text-lg`;

const ActionButton = twc(ArrowButton)`w-full`;
