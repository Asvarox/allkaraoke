import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { Calibration } from '~/modules/calibration/calibration';
import { Menu } from '~/modules/elements/akui/menu';
import WizardChecklist, { WizardStepEntry } from '~/modules/elements/akui/wizard-checklist';
import { Input } from '~/modules/elements/input';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useMicMonitoring from '~/modules/hooks/use-mic-monitoring';
import { checkRoomExists } from '~/modules/online/client/online-client';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { CalibrationIntro } from '~/routes/game/singing/calibration-intro';
import useOnlineName from '~/routes/online/hooks/use-online-name';
import BuiltIn from '~/routes/select-input/variants/built-in';
import { IsCalibratedSetting, MicSetupPreferenceSetting, useSettingValue } from '~/routes/settings/settings-state';

const generateRoomCode = () => {
  let code = '';
  for (let i = 0; i < ONLINE_ROOM_CODE_LENGTH; i++) {
    code += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  }
  return code;
};

/** Step ids double as the checklist ordering — see `stepOrder` below. */
const STEP = { code: 0, name: 1, mic: 2, calibration: 3 } as const;
type Step = (typeof STEP)[keyof typeof STEP];

const STEP_LABELS: Record<Step, string> = {
  [STEP.code]: 'Enter Room Code',
  [STEP.name]: 'Set Your Name',
  [STEP.mic]: 'Set Up Microphone',
  [STEP.calibration]: 'Sync Video With Sound',
};

// Matches the remote-mic wizard's step crossfade — long enough to read as a transition, short
// enough never to be waited on
const STEP_TRANSITION_S = 0.2;

interface Props {
  /** 'create' opens a brand-new room; 'join' asks for (or confirms) a room code first. */
  mode: 'create' | 'join';
  /** Room code when arriving via an invite link — prefills the code step. */
  joinRoomCode?: string | null;
  onComplete: (roomCode: string, options: { create: boolean }) => void;
  onBack: () => void;
}

/**
 * Everything that has to happen before entering a room, as the same checklist the remote mic uses:
 * room code (join only) → name (skipped when remembered) → microphone → calibration (skipped when
 * already calibrated). Calibrating here rather than in the lobby means readying up is a single click.
 */
function OnlineSetupWizard({ mode, joinRoomCode = null, onComplete, onBack }: Props) {
  const { name: storedName, hasStoredName, setName: persistName } = useOnlineName();
  const [isCalibrated, setIsCalibrated] = useSettingValue(IsCalibratedSetting);

  // Which steps this singer actually walks through, decided once on mount: a remembered name and an
  // earlier calibration drop out entirely, and completing a step must not shrink the checklist.
  const [stepOrder] = useState<Step[]>(() => {
    const steps: Step[] = [];
    if (mode === 'join') steps.push(STEP.code);
    if (!hasStoredName) steps.push(STEP.name);
    steps.push(STEP.mic);
    if (!isCalibrated) steps.push(STEP.calibration);
    return steps;
  });

  const [step, setStep] = useState<Step>(stepOrder[0]);
  // The room decision from the code step, applied once the whole wizard finishes
  const roomTarget = useRef<{ roomCode: string; create: boolean }>(
    mode === 'create'
      ? { roomCode: generateRoomCode(), create: true }
      : { roomCode: joinRoomCode ?? '', create: false },
  );

  const goToNextStep = () => {
    const next = stepOrder[stepOrder.indexOf(step) + 1];
    if (next === undefined) {
      onComplete(roomTarget.current.roomCode, { create: roomTarget.current.create });
    } else {
      setStep(next);
    }
  };

  const goToPreviousStep = () => {
    const previous = stepOrder[stepOrder.indexOf(step) - 1];
    if (previous === undefined) {
      onBack();
    } else {
      setStep(previous);
    }
  };

  const onCodeConfirmed = (roomCode: string) => {
    roomTarget.current = { roomCode, create: false };
    goToNextStep();
  };

  const onNameConfirmed = (name: string) => {
    persistName(name);
    goToNextStep();
  };

  const onCalibrated = () => {
    setIsCalibrated(true);
    goToNextStep();
  };

  // The completed room-code entry shows which room is being joined, like the remote mic's game code
  const getStepLabel = (entry: Step, completed: boolean) =>
    entry === STEP.code && completed
      ? `Joining room: ${roomTarget.current.roomCode.toUpperCase()}`
      : STEP_LABELS[entry];

  const completedSteps: WizardStepEntry[] = stepOrder
    .slice(0, stepOrder.indexOf(step))
    .map((entry) => ({ id: entry, label: getStepLabel(entry, true) }));

  return (
    <MenuWithLogo>
      <WizardChecklist completedSteps={completedSteps} activeStep={{ id: step, label: getStepLabel(step, false) }} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: STEP_TRANSITION_S }}
          className="flex flex-col gap-4">
          {step === STEP.code && (
            <CodeStep initialCode={joinRoomCode ?? ''} onConfirm={onCodeConfirmed} onBack={goToPreviousStep} />
          )}
          {step === STEP.name && (
            <NameStep initialName={storedName} onConfirm={onNameConfirmed} onBack={goToPreviousStep} />
          )}
          {step === STEP.mic && (
            <MicStep
              onBack={goToPreviousStep}
              onSave={goToNextStep}
              // The last step's button says what actually happens next
              closeButtonText={isCalibrated ? 'Enter the room' : 'Next'}
            />
          )}
          {step === STEP.calibration && <CalibrationStep onDone={onCalibrated} />}
        </motion.div>
      </AnimatePresence>
    </MenuWithLogo>
  );
}

/** Room code entry — verified against the server before moving on, so a typo is caught here. */
function CodeStep({
  initialCode,
  onConfirm,
  onBack,
}: {
  initialCode: string;
  onConfirm: (roomCode: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<{
    element: HTMLInputElement | null;
    triggerValidationError: (message: string) => void;
  } | null>(null);

  const { register } = useKeyboardNav({ onBackspace: onBack });

  const submit = async () => {
    const roomCode = code.trim().toLowerCase();
    if (roomCode.length < 3) {
      inputRef.current?.triggerValidationError('Enter the room code');
      return;
    }
    setChecking(true);
    const exists = await checkRoomExists(roomCode);
    setChecking(false);
    if (!exists) {
      inputRef.current?.triggerValidationError('This room does not exist');
      return;
    }
    onConfirm(roomCode);
  };

  return (
    <>
      <Menu.HelpText>Ask the host for the code shown in their room.</Menu.HelpText>
      <Input
        {...register('online-room-code', () => undefined)}
        className="[&_input]:text-center [&_input]:tracking-[1rem] [&_input]:uppercase"
        label="Room code"
        value={code}
        onChange={setCode}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
        }}
        maxLength={ONLINE_ROOM_CODE_LENGTH}
        placeholder="_____"
        autoCapitalize="characters"
        autoComplete="off"
        ref={inputRef}
        data-test="join-room-code-input"
      />
      <Menu.Button
        {...register('join-room-button', () => void submit())}
        disabled={checking}
        data-test="join-room-button">
        {checking ? 'Checking the room…' : 'Join a room'}
      </Menu.Button>
      <Menu.Divider />
      <Menu.Button {...register('back-button', onBack)} size="small" data-test="back-button">
        Back
      </Menu.Button>
    </>
  );
}

function NameStep({
  initialName,
  onConfirm,
  onBack,
}: {
  initialName: string;
  onConfirm: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initialName);
  const { register } = useKeyboardNav({ onBackspace: onBack });

  const submit = () => {
    if (name.trim()) onConfirm(name);
  };

  return (
    <>
      <Input
        {...register('online-name', submit)}
        label="Your name"
        value={name}
        onChange={setName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
        maxLength={MAX_NAME_LENGTH}
        placeholder="Enter your name"
        data-test="online-name-input"
      />
      <Menu.Button {...register('next-step-button', submit)} disabled={!name.trim()} data-test="next-step-button">
        Next
      </Menu.Button>
      <Menu.Divider />
      <Menu.Button {...register('back-button', onBack)} size="small" data-test="back-button">
        Back
      </Menu.Button>
    </>
  );
}

/** Microphone setup — reuses the "computer's built-in microphone" flow from input selection. */
function MicStep({
  onBack,
  onSave,
  closeButtonText,
}: {
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
}) {
  useMicMonitoring();

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
      closeButtonText={closeButtonText}
      onlineSetup
    />
  );
}

/** One-time audio calibration, moved ahead of the lobby so readying up never interrupts it. */
function CalibrationStep({ onDone }: { onDone: () => void }) {
  const [showIntro, setShowIntro] = useState(true);

  return showIntro ? (
    <CalibrationIntro onContinue={() => setShowIntro(false)} />
  ) : (
    <Calibration onSave={onDone} onClose={() => setShowIntro(true)} saveLabel="Looks good, enter the room" />
  );
}

export default OnlineSetupWizard;
