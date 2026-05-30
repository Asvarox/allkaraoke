import { SelectedPlayerInput } from '~/modules/players/players-manager';

export const getInputId = (input: Pick<SelectedPlayerInput, 'deviceId' | 'channel'>) =>
  `${input.deviceId};${input.channel}`;
