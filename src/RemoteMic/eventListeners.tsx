import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import events from 'GameEvents/GameEvents';
import { toast } from 'react-toastify';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';

events.playerInputChanged.subscribe((playerNumber, oldInput, newInput) => {
    if (oldInput?.inputSource === RemoteMicrophoneInputSource.inputName) {
        const playerNumber = InputManager.getInputs().findIndex(
            (input) => input.inputSource === 'Remote Microphone' && input.deviceId === oldInput.deviceId,
        );
        const unselectedRemoteMic = RemoteMicManager.getRemoteMicById(oldInput.deviceId!);

        unselectedRemoteMic?.setPlayerNumber(playerNumber >= 0 ? playerNumber : null);
    }
    if (newInput?.inputSource === 'Remote Microphone') {
        const selectedRemoteMic = RemoteMicManager.getRemoteMicById(newInput.deviceId!);

        selectedRemoteMic?.setPlayerNumber(playerNumber);
    }
});
events.remoteMicConnected.subscribe(({ id }) => {
    const playerNumberIndex = InputManager.getRawInputs().findIndex(
        (input) => input.inputSource === 'Remote Microphone' && input.deviceId === id,
    );

    if (playerNumberIndex > -1) {
        const remoteMic = RemoteMicManager.getRemoteMicById(id);

        remoteMic?.setPlayerNumber(playerNumberIndex);

        if (InputManager.monitoringStarted()) {
            remoteMic?.getInput()?.startMonitoring();
        }
    }
});

events.playerChangeRequested.subscribe((phoneId, newPlayerNumber) => {
    const currentPlayerNumber = InputManager.getRawInputs().findIndex((input) => input.deviceId === phoneId);

    if (currentPlayerNumber > -1) {
        InputManager.setPlayerInput(currentPlayerNumber, 'Dummy', 0);
    }
    if (newPlayerNumber !== null) {
        InputManager.setPlayerInput(newPlayerNumber, 'Remote Microphone', 0, phoneId);
    }
});

events.remoteMicConnected.subscribe(({ name, silent }) => {
    if (!silent) {
        toast.success(
            <>
                Remote microphone <b className="ph-no-capture">{name}</b> connected!
            </>,
        );
    }
});
events.remoteMicDisconnected.subscribe(({ name }, silent) => {
    if (!silent) {
        toast.warning(
            <>
                Remote microphone <b className="ph-no-capture">{name}</b> disconnected!
            </>,
        );
    }
});
