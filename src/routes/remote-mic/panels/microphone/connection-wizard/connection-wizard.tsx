import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import events from '~/modules/game-events/game-events';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import userMediaService from '~/modules/user-media/user-media-service';
import startViewTransition from '~/modules/utils/start-view-transition';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import useRemoteMicName from '~/routes/remote-mic/hooks/use-remote-mic-name';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';

import StepAllowMic from './step-allow-mic';
import StepEnterCode from './step-enter-code';
import StepLoadingMic from './step-loading-mic';
import StepPickPlayer from './step-pick-player';
import StepSetName from './step-set-name';
import WizardChecklist, { WizardStepEntry } from './wizard-checklist';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  onWizardComplete: () => void;
}

const STEP_LABELS: Record<number, string> = {
  0: 'Allow Microphone',
  1: 'Enter Game Code',
  2: 'Set Your Name',
  3: 'Choose Color',
};
const LOADING_MIC_LABEL = 'Loading Microphone';
// Sentinel id for the mic-loading pseudo-step, which has no numeric step of its own
const LOADING_MIC_ID = -1;

const MIN_CONNECTING_DISPLAY_MS = 1500;
const MIN_MIC_LOADING_DISPLAY_MS = 1500;

// Cached result of the mic permission probe — persists across tab switches so
// re-mounting the wizard skips the loader and starts on the correct step immediately
let cachedInitialStep: number | null = null;

export default function ConnectionWizard({ roomId, connectionStatus, connectionError, onWizardComplete }: Props) {
  // null = probing mic permission (shows loader), number = active wizard step
  const [currentStep, setCurrentStep] = useState<number | null>(cachedInitialStep);
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(roomId);
  const stepDirectionRef = useRef<'forward' | 'backward'>('forward');
  const connectingStartedAtRef = useRef<number | null>(null);
  const navigate = useSmoothNavigate();
  const permissions = usePermissions();

  const { name: effectiveName, hasStoredName, setName: setPersistedName } = useRemoteMicName();

  // Lets e2e tests (and anyone sharing a link) inspect the pre-connection state: the code still
  // gets prefilled/revealed, but nothing connects until the user submits it themselves
  const autoConnect = useQueryParam('autoconnect') !== 'false';

  // Mirrors connectionStatus but enforces a minimum display time for the connecting state,
  // so the "Connecting…" overlay isn't dismissed too abruptly before advancing or showing an error
  const [delayedConnectionStatus, setDelayedConnectionStatus] = useState<ConnectionStatuses>(connectionStatus);
  const goToStep = (step: number) => {
    stepDirectionRef.current = currentStep !== null && step < currentStep ? 'backward' : 'forward';

    const directionClass = stepDirectionRef.current === 'forward' ? 'vt-forward' : 'vt-backward';
    document.documentElement.classList.add(directionClass);
    const transition = startViewTransition(() => {
      flushSync(() => setCurrentStep(step));
    });
    if (transition) {
      transition.finished.finally(() => {
        document.documentElement.classList.remove('vt-forward', 'vt-backward');
      });
    } else {
      document.documentElement.classList.remove('vt-forward', 'vt-backward');
    }
  };

  // Completes the wizard with a forward view transition so the keyboard view animates in
  const completeWizard = () => {
    document.documentElement.classList.add('vt-forward');
    const transition = startViewTransition(() => {
      flushSync(onWizardComplete);
    });
    if (transition) {
      transition.finished.finally(() => {
        document.documentElement.classList.remove('vt-forward');
      });
    } else {
      document.documentElement.classList.remove('vt-forward');
    }
  };

  // Once connected, move on to the color picker unless the user is read-only or already has an
  // assigned player number (e.g. a reconnect), in which case the wizard is done
  const finishAfterName = () => {
    const [assignedPlayerNumber] = events.remoteMicPlayerSet.lastParams ?? [null];
    if (permissions !== 'write' || (assignedPlayerNumber !== null && assignedPlayerNumber !== undefined)) {
      completeWizard();
    } else {
      goToStep(3);
    }
  };

  const handleConnect = (resolvedRoomId: string) => {
    setConnectedRoomId(resolvedRoomId);
    RemoteMicClient.connect(resolvedRoomId, effectiveName, false);
    // Stay on step 1 — connection status changes will drive the transition to the name step
  };

  const handleNameComplete = (finalName: string) => {
    setPersistedName(finalName);
    if (finalName !== effectiveName) {
      RemoteMicClient.renameSelf(finalName);
    }
    finishAfterName();
  };

  useEffect(() => {
    // Skip the probe if we already have a cached result from a previous mount
    if (cachedInitialStep !== null) {
      setCurrentStep(cachedInitialStep);
      return;
    }
    // Show the "Loading microphone" step for a beat before requesting permission, then probe once
    // to decide the starting step — avoids flashing the "Allow Microphone" step when permission
    // was already granted on a previous visit
    const timer = setTimeout(() => {
      userMediaService
        .getUserMedia({ audio: true })
        .then(() => {
          cachedInitialStep = 1;
          goToStep(1);
        }) // already granted → skip mic step
        .catch(() => {
          // Don't cache denial — re-mounting will re-probe, allowing recovery
          // after the user grants mic permission in browser settings
          goToStep(0);
        }); // denied → show blocked instructions
    }, MIN_MIC_LOADING_DISPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
      connectingStartedAtRef.current = Date.now();
      setDelayedConnectionStatus(connectionStatus);
      return;
    }

    const elapsed =
      connectingStartedAtRef.current !== null ? Date.now() - connectingStartedAtRef.current : MIN_CONNECTING_DISPLAY_MS;
    const remaining = MIN_CONNECTING_DISPLAY_MS - elapsed;

    if (remaining <= 0) {
      setDelayedConnectionStatus(connectionStatus);
      return;
    }

    // Wait out the remaining minimum display time before applying the new status
    const timer = setTimeout(() => setDelayedConnectionStatus(connectionStatus), remaining);
    return () => clearTimeout(timer);
  }, [connectionStatus]);

  useEffect(() => {
    // Once connected, after the minimum display time has elapsed: a remembered name needs no
    // confirmation, so skip straight past the "Set Your Name" step entirely; otherwise show it
    if (currentStep === 1 && delayedConnectionStatus === 'connected') {
      if (hasStoredName) {
        finishAfterName();
      } else {
        goToStep(2);
      }
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [delayedConnectionStatus, currentStep]);

  useEffect(() => {
    if (!roomId && connectedRoomId && delayedConnectionStatus === 'connected') {
      navigate('remote-mic/', { room: connectedRoomId });
    }
  }, [connectedRoomId, delayedConnectionStatus, navigate, roomId]);

  const renderStep = () => {
    switch (currentStep) {
      case null:
        return <StepLoadingMic />;
      case 0:
        return <StepAllowMic onComplete={() => goToStep(1)} />;
      case 1:
        return (
          <StepEnterCode
            roomId={roomId}
            onConnect={handleConnect}
            connectionStatus={delayedConnectionStatus}
            connectionError={connectionError}
            autoConnect={autoConnect}
          />
        );
      case 2:
        return <StepSetName initialName={effectiveName} onComplete={handleNameComplete} />;
      case 3:
        return <StepPickPlayer onComplete={completeWizard} />;
      default:
        return null;
    }
  };

  // The "Enter Game Code" step's completed label swaps in the game code it connected with
  const getStepLabel = (step: number, completed: boolean) => {
    if (step === 1 && completed) return `Connected to game: ${(connectedRoomId ?? '').toUpperCase()}`;
    return STEP_LABELS[step];
  };

  // With a remembered name, step 2 ("Set Your Name") is skipped entirely and must not show up as
  // a completed checklist entry either
  const stepOrder = hasStoredName ? [0, 1, 3] : [0, 1, 2, 3];
  const completedSteps: WizardStepEntry[] =
    currentStep === null
      ? []
      : stepOrder.filter((step) => step < currentStep).map((step) => ({ id: step, label: getStepLabel(step, true) }));
  const activeStep: WizardStepEntry =
    currentStep === null
      ? { id: LOADING_MIC_ID, label: LOADING_MIC_LABEL }
      : { id: currentStep, label: getStepLabel(currentStep, false) };

  return (
    <div className="flex h-full flex-col px-2 pt-4">
      <>
        <div className="">
          <WizardChecklist completedSteps={completedSteps} activeStep={activeStep} />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="wizard-step-content flex h-full flex-col">{renderStep()}</div>
        </div>
      </>

      <style>{`
        .wizard-step-content {
          view-transition-name: wizard-step;
        }

        @keyframes wizardSlideInFromBottom { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes wizardFadeOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(0); opacity: 0; } }

        html.vt-forward::view-transition-old(wizard-step),
        html.vt-backward::view-transition-old(wizard-step) { animation: wizardFadeOut 150ms ease-in both; }
        html.vt-forward::view-transition-new(wizard-step),
        html.vt-backward::view-transition-new(wizard-step) { animation: wizardSlideInFromBottom 300ms ease-out both; }

        /* Suppress the default root cross-fade so only the wizard step animates */
        ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
      `}</style>
    </div>
  );
}
