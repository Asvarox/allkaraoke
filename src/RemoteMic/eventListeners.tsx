import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import events from 'GameEvents/GameEvents';
import PhoneManager from './PhoneManager';
import { toast } from 'react-toastify';

events.playerInputChanged.subscribe((playerNumber, oldInput, newInput) => {
    if (oldInput?.inputSource === RemoteMicrophoneInputSource.inputName) {
        const playerNumber = InputManager.getInputs().findIndex(
            (input) => input.inputSource === 'Remote Microphone' && input.deviceId === oldInput.deviceId,
        );
        const unselectedPhone = PhoneManager.getPhoneById(oldInput.deviceId!);

        unselectedPhone?.setPlayerNumber(playerNumber >= 0 ? playerNumber : null);
    }
    if (newInput?.inputSource === 'Remote Microphone') {
        const selectedPhone = PhoneManager.getPhoneById(newInput.deviceId!);

        selectedPhone?.setPlayerNumber(playerNumber);
    }
});
events.phoneConnected.subscribe(({ id }) => {
    const playerNumberIndex = InputManager.getRawInputs().findIndex(
        (input) => input.inputSource === 'Remote Microphone' && input.deviceId === id,
    );

    if (playerNumberIndex > -1) {
        const phone = PhoneManager.getPhoneById(id);

        phone?.setPlayerNumber(playerNumberIndex);

        if (InputManager.monitoringStarted()) {
            phone?.getInput()?.startMonitoring();
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

events.phoneConnected.subscribe(({ name, silent }) => {
    if (!silent) {
        toast.success(
            <>
                Remote microphone <b>{name}</b> connected!
            </>,
        );
    }
});
events.phoneDisconnected.subscribe(({ name }, silent) => {
    if (!silent) {
        toast.warning(
            <>
                Remote microphone <b>{name}</b> disconnected!
            </>,
        );
    }
});
