import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import events from '~/modules/game-events/game-events';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import userMediaService from '~/modules/user-media/user-media-service';
import startViewTransition from '~/modules/utils/start-view-transition';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';
import StepAllowMic from './step-allow-mic';
import StepEnterDetails from './step-enter-details';
import StepPickPlayer from './step-pick-player';
import WizardProgressBar from './wizard-progress-bar';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  onWizardComplete: () => void;
}

const STEPS = [{ label: 'Allow Microphone' }, { label: 'Enter Details' }, { label: 'Choose Color' }];

const MIN_CONNECTING_DISPLAY_MS = 1000;

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

  // Mirrors connectionStatus but enforces a minimum display time for the connecting state,
  // so the "Connecting…" overlay isn't dismissed too abruptly before advancing or showing an error
  const [delayedConnectionStatus, setDelayedConnectionStatus] = useState<ConnectionStatuses>(connectionStatus);

  useEffect(() => {
    // Skip the probe if we already have a cached result from a previous mount
    if (cachedInitialStep !== null) return;
    // Probe mic permission once to decide starting step — avoids flashing the
    // "Allow Microphone" step when permission was already granted on a previous visit
    userMediaService
      .getUserMedia({ audio: true })
      .then(() => {
        cachedInitialStep = 1;
        setCurrentStep(1);
      }) // already granted → skip mic step
      .catch(() => {
        // Don't cache denial — re-mounting will re-probe, allowing recovery
        // after the user grants mic permission in browser settings
        setCurrentStep(0);
      }); // denied → show blocked instructions
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
    if (
      delayedConnectionStatus === 'connected' &&
      permissions !== 'write' &&
      (currentStep === 1 || currentStep === 2)
    ) {
      completeWizard();
      return;
    }

    // Advance to PickPlayer once connected, after the minimum display time has elapsed.
    // If the server already assigned a player number (reconnect case), skip the color picker entirely.
    if (currentStep === 1 && delayedConnectionStatus === 'connected') {
      const [assignedPlayerNumber] = events.remoteMicPlayerSet.lastParams ?? [null];
      if (assignedPlayerNumber !== null && assignedPlayerNumber !== undefined) {
        completeWizard();
      } else {
        goToStep(2);
      }
    }
  }, [delayedConnectionStatus, currentStep, permissions]);

  useEffect(() => {
    if (!roomId && connectedRoomId && delayedConnectionStatus === 'connected') {
      navigate('remote-mic/', { room: connectedRoomId });
    }
  }, [connectedRoomId, delayedConnectionStatus, navigate, roomId]);

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

  const handleConnect = (resolvedRoomId: string, name: string) => {
    setConnectedRoomId(resolvedRoomId);
    RemoteMicClient.connect(resolvedRoomId, name, false);
    // Stay on step 1 — connection status changes will drive the transition to PickPlayer
  };

  const renderStep = () => {
    switch (currentStep ?? 0) {
      case 0:
        return <StepAllowMic onComplete={() => goToStep(1)} />;
      case 1:
        return (
          <StepEnterDetails
            roomId={roomId}
            onConnect={handleConnect}
            connectionStatus={delayedConnectionStatus}
            connectionError={connectionError}
          />
        );
      case 2:
        return <StepPickPlayer onComplete={completeWizard} />;
      default:
        return null;
    }
  };

  // While probing mic permission (currentStep === null), default to step 0 so
  // the user sees the "Allow Microphone" instructions rather than a blank loader
  // while the browser permission dialog is open.
  const displayStep = currentStep ?? 0;

  return (
    <div className="flex h-full flex-col px-2 pt-4">
      <>
        <div className="">
          <WizardProgressBar currentStep={displayStep} totalSteps={STEPS.length} stepLabel={STEPS[displayStep].label} />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="wizard-step-content flex h-full flex-col">{renderStep()}</div>
        </div>
      </>

      <style>{`
        .wizard-step-content {
          view-transition-name: wizard-step;
        }

        @keyframes wizardSlideInFromRight { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes wizardSlideOutToLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30%); opacity: 0; } }
        @keyframes wizardSlideInFromLeft { from { transform: translateX(-30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes wizardSlideOutToRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(30%); opacity: 0; } }

        html.vt-forward::view-transition-old(wizard-step) { animation: wizardSlideOutToLeft 300ms ease-in both; }
        html.vt-forward::view-transition-new(wizard-step) { animation: wizardSlideInFromRight 300ms ease-out both; }
        html.vt-backward::view-transition-old(wizard-step) { animation: wizardSlideOutToRight 300ms ease-in both; }
        html.vt-backward::view-transition-new(wizard-step) { animation: wizardSlideInFromLeft 300ms ease-out both; }

        /* Suppress the default root cross-fade so only the wizard step animates */
        ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
      `}</style>
    </div>
  );
}
