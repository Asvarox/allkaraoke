import InputManager from '~/modules/GameEngine/Input/InputManager';
import events from '~/modules/GameEvents/GameEvents';
import PlayersManager from '~/modules/Players/PlayersManager';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import isPreRendering from '~/modules/utils/isPreRendering';
import { RemoteMicrophoneInputSource } from '~/routes/SelectInput/InputSources/Remote';

events.playerRemoved.subscribe((player) => {
  if (player.input.source === RemoteMicrophoneInputSource.inputName) {
    const remoteMic = RemoteMicManager.getRemoteMicById(player.input.deviceId!);
    if (remoteMic) {
      remoteMic.setPlayerNumber(null);
    }
  }
});

events.playerInputChanged.subscribe((playerNumber, oldInput, newInput) => {
  if (oldInput?.source === RemoteMicrophoneInputSource.inputName) {
    const playerNumber = PlayersManager.getPlayers().find(
      (player) => player.input.source === 'Remote Microphone' && player.input.deviceId === oldInput.deviceId,
    )?.number;
    const unselectedRemoteMic = RemoteMicManager.getRemoteMicById(oldInput.deviceId!);

    unselectedRemoteMic?.setPlayerNumber(playerNumber !== undefined ? playerNumber : null);
  }
  if (newInput?.source === 'Remote Microphone') {
    const selectedRemoteMic = RemoteMicManager.getRemoteMicById(newInput.deviceId!);

    selectedRemoteMic?.setPlayerNumber(playerNumber);
  }
});
events.remoteMicConnected.subscribe(({ id }) => {
  const playerNumberIndex = PlayersManager.getPlayers().find(
    (player) => player.input.source === 'Remote Microphone' && player.input.deviceId === id,
  )?.number;

  if (playerNumberIndex !== undefined) {
    const remoteMic = RemoteMicManager.getRemoteMicById(id);

    remoteMic?.setPlayerNumber(playerNumberIndex);

    if (InputManager.monitoringStarted()) {
      remoteMic?.getInput()?.startMonitoring();
    }
  }
});

events.playerChangeRequested.subscribe((phoneId, newPlayerNumber) => {
  const currentPlayer = PlayersManager.getPlayers().find((player) => player.input.deviceId === phoneId);

  if (currentPlayer) {
    PlayersManager.removePlayer(currentPlayer.number);
  }
  if (newPlayerNumber !== null) {
    const player = PlayersManager.getPlayer(newPlayerNumber);

    if (player) {
      player.changeInput('Remote Microphone', 0, phoneId);
    } else {
      PlayersManager.addPlayer(newPlayerNumber)?.changeInput('Remote Microphone', 0, phoneId);
    }
  }
});

events.remoteMicConnected.subscribe(async ({ name, id, silent }) => {
  if (!isPreRendering) {
    if (!silent) {
      (await import('react-toastify')).toast.success(
        <>
          Remote microphone <b className="ph-no-capture">{name}</b> connected!
        </>,
        {
          toastId: `connection-status-${id}`,
          updateId: `connection-status-${id}`,
        },
      );
    }
  }
});
events.remoteMicDisconnected.subscribe(async ({ name, id }, silent) => {
  if (!isPreRendering) {
    if (!silent) {
      (await import('react-toastify')).toast.warning(
        <>
          Remote microphone <b className="ph-no-capture">{name}</b> disconnected!
        </>,
        {
          toastId: `connection-status-${id}`,
          updateId: `connection-status-${id}`,
        },
      );
    }
  }
});

const sendPlayerStates = () => {
  const remoteMics = RemoteMicManager.getRemoteMics().map((mic) => ({
    id: mic.id,
    name: mic.name,
    number: PlayersManager.getPlayers().find((player) => player.input.deviceId === mic.id)?.number ?? null,
  }));

  RemoteMicManager.broadcastToChannel('remote-mics', { t: 'remote-mics-list', list: remoteMics });
};

events.playerRemoved.subscribe(sendPlayerStates);
events.inputListChanged.subscribe(sendPlayerStates);
events.playerInputChanged.subscribe(sendPlayerStates);
events.remoteMicSubscribed.subscribe(sendPlayerStates);
