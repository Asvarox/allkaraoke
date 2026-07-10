import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MAX_NAME_LENGTH } from '~/consts';
import { Menu } from '~/modules/elements/akui/menu';
import { Stepper } from '~/modules/elements/akui/stepper';
import { useBackground } from '~/modules/elements/background-context';
import { Input } from '~/modules/elements/input';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import InputManager from '~/modules/game-engine/input/input-manager';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { checkRoomExists, ONLINE_NAME_KEY } from '~/modules/online/client/online-client';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import storage from '~/modules/utils/storage';
import BuiltIn from '~/routes/select-input/variants/built-in';
import { MicSetupPreferenceSetting } from '~/routes/settings/settings-state';

const generateRoomCode = () => {
  let code = '';
  for (let i = 0; i < ONLINE_ROOM_CODE_LENGTH; i++) {
    code += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  }
  return code;
};

interface Props {
  /** Room code when arriving via an invite link; null when creating/joining manually. */
  joinRoomCode: string | null;
  onComplete: (roomCode: string, options: { create: boolean }) => void;
}

const STEPS = ['Room', 'Name', 'Microphone'];
type Step = 'room' | 'name' | 'mic';
const stepIndex: Record<Step, number> = { room: 0, name: 1, mic: 2 };

/** Three-step flow before entering a room: open/join the room → set your name → set up your mic. */
function OnlineSetupWizard({ joinRoomCode, onComplete }: Props) {
  useBackground(true);
  const navigate = useSmoothNavigate();
  const [step, setStep] = useState<Step>('room');
  const [name, setName] = useState<string>(storage.getItem(ONLINE_NAME_KEY) ?? '');
  const [joinCode, setJoinCode] = useState('');
  const [checkingRoom, setCheckingRoom] = useState(false);
  // The room decision from step 1, applied after the final step
  const roomTarget = useRef<{ roomCode: string; create: boolean } | null>(null);
  const joinInputRef = useRef<{
    element: HTMLInputElement | null;
    triggerValidationError: (message: string) => void;
  } | null>(null);

  const { register } = useKeyboardNav();

  const createRoom = () => {
    roomTarget.current = { roomCode: generateRoomCode(), create: true };
    setStep('name');
  };

  const joinRoom = async (code: string) => {
    if (code.length < 3) {
      joinInputRef.current?.triggerValidationError('Enter the room code');
      return;
    }
    setCheckingRoom(true);
    const exists = await checkRoomExists(code);
    setCheckingRoom(false);
    if (!exists) {
      joinInputRef.current?.triggerValidationError('This room does not exist');
      return;
    }
    roomTarget.current = { roomCode: code, create: false };
    setStep('name');
  };

  const submitName = () => {
    if (!name.trim()) return;
    storage.setItem(ONLINE_NAME_KEY, name.trim());
    setStep('mic');
  };

  const finish = () => {
    const target = roomTarget.current ?? { roomCode: joinRoomCode ?? generateRoomCode(), create: false };
    onComplete(target.roomCode, { create: target.create });
  };

  return (
    <MenuWithLogo>
      {/* The stepper disappears once the final step is reached */}
      <AnimatePresence>{step !== 'mic' && <Stepper steps={STEPS} current={stepIndex[step]} />}</AnimatePresence>
      <Menu.Header data-test="online-setup-header">
        {joinRoomCode ? `Join room "${joinRoomCode}"` : 'Sing Online'}
      </Menu.Header>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-3">
          {step === 'room' &&
            (joinRoomCode ? (
              <>
                <Menu.HelpText>
                  You&#39;ve been invited to sing together — up to 6 people, each on their own device.
                </Menu.HelpText>
                <Menu.Button
                  {...register('join-room-button', () => void joinRoom(joinRoomCode))}
                  disabled={checkingRoom}
                  data-test="join-room-button">
                  Join the room
                </Menu.Button>
                <Menu.Divider />
                <Menu.Button {...register('back-button', () => navigate('menu/'))} size="small" data-test="back-button">
                  Back to main menu
                </Menu.Button>
              </>
            ) : (
              <>
                <Menu.HelpText>
                  Sing together with up to 6 people, each on their own device with their own microphone.
                </Menu.HelpText>
                <Menu.Button {...register('create-room-button', createRoom)} data-test="create-room-button">
                  Open a new room
                </Menu.Button>
                <Menu.Divider />
                <Input
                  {...register('online-room-code', () => undefined)}
                  label="Room code"
                  value={joinCode}
                  onChange={setJoinCode}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void joinRoom(joinCode.trim().toLowerCase());
                  }}
                  placeholder="e.g. abcde"
                  ref={joinInputRef}
                  data-test="join-room-code-input"
                />
                <Menu.Button
                  {...register('join-room-button', () => void joinRoom(joinCode.trim().toLowerCase()))}
                  disabled={checkingRoom}
                  data-test="join-room-button">
                  {checkingRoom ? 'Checking the room…' : 'Join a room'}
                </Menu.Button>
                <Menu.Divider />
                <Menu.Button {...register('back-button', () => navigate('menu/'))} size="small" data-test="back-button">
                  Back to main menu
                </Menu.Button>
              </>
            ))}
          {step === 'name' && (
            <>
              <Input
                {...register('online-name', submitName)}
                label="Your name"
                value={name}
                onChange={setName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitName();
                }}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Enter your name"
                data-test="online-name-input"
              />
              <Menu.Button
                {...register('next-step-button', submitName)}
                disabled={!name.trim()}
                data-test="next-step-button">
                Next
              </Menu.Button>
              <Menu.Divider />
              <Menu.Button {...register('back-button', () => setStep('room'))} size="small" data-test="back-button">
                Back
              </Menu.Button>
            </>
          )}
          {step === 'mic' && <MicStep onBack={() => setStep('name')} onSave={finish} />}
        </motion.div>
      </AnimatePresence>
    </MenuWithLogo>
  );
}

/** Microphone setup — reuses the "computer's built-in microphone" flow from input selection. */
function MicStep({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  useEffect(() => {
    const wasMonitoring = InputManager.monitoringStarted();
    InputManager.startMonitoring();
    return () => {
      if (!wasMonitoring) {
        InputManager.stopMonitoring();
      }
    };
  }, []);

  const save = () => {
    // Mark mic setup as done so e.g. the song-settings step shows Play instead of "Setup mics"
    MicSetupPreferenceSetting.set('built-in');
    onSave();
  };

  return (
    <BuiltIn
      onSetupComplete={() => undefined}
      onBack={onBack}
      onSave={save}
      changePreference={() => undefined}
      closeButtonText="Enter the room"
      onlineSetup
    />
  );
}

export default OnlineSetupWizard;
