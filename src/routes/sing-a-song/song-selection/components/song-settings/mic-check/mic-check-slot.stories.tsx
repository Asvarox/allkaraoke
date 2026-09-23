import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';
import InputManager from '~/modules/game-engine/input/input-manager';
import { inputStatus } from '~/modules/game-engine/input/interface';
import { PlayerNumber } from '~/modules/players/player-number';
import PlayersManager, { PlayerEntity } from '~/modules/players/players-manager';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';

import MicCheckSlot from './mic-check-slot';

const storyPlayers = [
  undefined,
  new PlayerEntity(1, { source: 'Remote Microphone', deviceId: 'storybook-ok', channel: 0 }, 'Connected / OK'),
  new PlayerEntity(
    2,
    { source: 'Remote Microphone', deviceId: 'storybook-unstable', channel: 0 },
    'Connected / Unstable',
  ),
  new PlayerEntity(
    3,
    { source: 'Remote Microphone', deviceId: 'storybook-unavailable', channel: 0 },
    'Connected / Unavailable',
  ),
] as const;

const statusesByPlayer: Partial<Record<PlayerNumber, inputStatus>> = {
  0: 'unavailable',
  1: 'ok',
  2: 'unstable',
  3: 'unavailable',
};

const pingByDeviceId = {
  'storybook-ok': 24,
  'storybook-unstable': 187,
  'storybook-unavailable': 0,
} as const;

function useStoryMicState() {
  useEffect(() => {
    const originalGetPlayer = PlayersManager.getPlayer;
    const originalGetPlayers = PlayersManager.getPlayers;
    const originalGetInputStatus = InputManager.getInputStatus;
    const originalGetPlayerVolume = InputManager.getPlayerVolume;
    const originalGetPlayerFrequency = InputManager.getPlayerFrequency;
    const originalGetRemoteMicById = RemoteMicManager.getRemoteMicById;

    PlayersManager.getPlayer = ((playerNumber: number) => {
      return storyPlayers.find((player) => player?.number === playerNumber);
    }) as typeof PlayersManager.getPlayer;

    PlayersManager.getPlayers = (() => {
      return storyPlayers.filter((player): player is PlayerEntity => player !== undefined);
    }) as typeof PlayersManager.getPlayers;

    InputManager.getInputStatus = ((playerNumber: PlayerNumber) => {
      return statusesByPlayer[playerNumber] ?? 'unavailable';
    }) as typeof InputManager.getInputStatus;

    InputManager.getPlayerVolume = ((playerNumber: PlayerNumber) => {
      if (playerNumber === 1) return 0.82;
      if (playerNumber === 2) return 0.46;
      return 0;
    }) as typeof InputManager.getPlayerVolume;

    InputManager.getPlayerFrequency = ((playerNumber: PlayerNumber) => {
      if (playerNumber === 1) return 440;
      if (playerNumber === 2) return 220;
      return 0;
    }) as typeof InputManager.getPlayerFrequency;

    RemoteMicManager.getRemoteMicById = ((deviceId: string) => {
      const latency = pingByDeviceId[deviceId as keyof typeof pingByDeviceId];
      if (latency === undefined) return undefined;

      return {
        getLatency: () => latency,
      };
    }) as typeof RemoteMicManager.getRemoteMicById;

    return () => {
      PlayersManager.getPlayer = originalGetPlayer;
      PlayersManager.getPlayers = originalGetPlayers;
      InputManager.getInputStatus = originalGetInputStatus;
      InputManager.getPlayerVolume = originalGetPlayerVolume;
      InputManager.getPlayerFrequency = originalGetPlayerFrequency;
      RemoteMicManager.getRemoteMicById = originalGetRemoteMicById;
    };
  }, []);
}

const SLOTS = [
  { label: 'No player connected', playerIndex: 0, player: storyPlayers[0] },
  { label: 'Connected', playerIndex: 1, player: storyPlayers[1] },
  { label: 'Connection unstable', playerIndex: 2, player: storyPlayers[2] },
  { label: 'Device unavailable', playerIndex: 3, player: storyPlayers[3] },
] as const;

function GalleryTemplate() {
  useStoryMicState();

  return (
    <StoryPage title="Mic Check Slot" description="Disconnected, healthy, unstable and dropped device states.">
      {SLOTS.map((slot) => (
        <StorySection key={slot.playerIndex} title={slot.label}>
          <MicCheckSlot playerIndex={slot.playerIndex} player={slot.player} />
        </StorySection>
      ))}
    </StoryPage>
  );
}

export default {
  title: 'Game/Song Selection/Mic Check Slot',
  component: MicCheckSlot,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MicCheckSlot>;

type Story = StoryObj<typeof MicCheckSlot>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
