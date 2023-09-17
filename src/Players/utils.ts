import { SelectedPlayerInput } from 'Players/PlayersManager';

export const getInputId = (input: Pick<SelectedPlayerInput, 'deviceId' | 'channel'>) =>
  `${input.deviceId};${input.channel}`;
