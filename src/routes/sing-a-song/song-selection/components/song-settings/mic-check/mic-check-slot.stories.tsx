import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import InputManager from '~/modules/game-engine/input/input-manager';
import { inputStatus } from '~/modules/game-engine/input/interface';
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

const statusesByPlayer: Record<0 | 1 | 2 | 3, inputStatus> = {
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

    InputManager.getInputStatus = ((playerNumber: 0 | 1 | 2 | 3) => {
      return statusesByPlayer[playerNumber];
    }) as typeof InputManager.getInputStatus;

    InputManager.getPlayerVolume = ((playerNumber: 0 | 1 | 2 | 3) => {
      if (playerNumber === 1) return 0.82;
      if (playerNumber === 2) return 0.46;
      return 0;
    }) as typeof InputManager.getPlayerVolume;

    InputManager.getPlayerFrequency = ((playerNumber: 0 | 1 | 2 | 3) => {
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

function GalleryTemplate() {
  useStoryMicState();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 p-8">
      <div className="typography flex w-150 flex-col gap-4 text-white">
        <div>
          <h1 className="text-2xl font-semibold">Mic Check Slot States</h1>
          <p className="text-sm text-stone-400">Disconnected, healthy, unstable, and dropped device states.</p>
        </div>
        <div className="flex flex-col gap-3">
          {(
            [
              { label: 'No Player Connected', playerIndex: 0 as const, player: storyPlayers[0] },
              { label: 'Connected', playerIndex: 1 as const, player: storyPlayers[1] },
              { label: 'Connection Unstable', playerIndex: 2 as const, player: storyPlayers[2] },
              { label: 'Device Unavailable', playerIndex: 3 as const, player: storyPlayers[3] },
            ] as const
          ).map((item) => (
            <div key={item.playerIndex} className="flex flex-col gap-2">
              <span className="text-sm font-medium tracking-wide text-stone-300 uppercase">{item.label}</span>
              <MicCheckSlot playerIndex={item.playerIndex} player={item.player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  title: 'Song Selection/Mic Check Slot',
  component: MicCheckSlot,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MicCheckSlot>;

type Story = StoryObj<typeof MicCheckSlot>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
