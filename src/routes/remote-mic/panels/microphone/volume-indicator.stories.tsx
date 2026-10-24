import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { PlayerNumber } from '~/modules/players/player-number';
import { withAppBackground } from '~/stories/app-background';

import { MicPillShell } from './volume-indicator';

type Args = ComponentProps<typeof MicPillShell>;

export default {
  title: 'Game/Remote Mic/Mic Pill',
  component: MicPillShell,
  decorators: [withAppBackground],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    volume: { control: { type: 'range', min: 0, max: 0.05, step: 0.001 } },
    playerNumber: { table: { disable: true } },
    action: { table: { disable: true } },
  },
  args: {
    volume: 0.03,
    isMicOn: true,
    // Stands in for `PlayerChange`, which needs the remote mic network client behind it.
    action: (
      <Button size="mini" className="z-1 ml-auto" fullWidth={false}>
        Change
      </Button>
    ),
    className: 'h-28 items-end',
  },
} satisfies Meta<Args>;

const PLAYERS: PlayerNumber[] = [0, 1, 2, 3, 4, 5];

export const AllPlayers: StoryFn<Args> = (args) => (
  <div className="mx-auto flex max-w-[45rem] flex-col gap-4 p-4">
    {PLAYERS.map((playerNumber) => (
      <MicPillShell key={playerNumber} {...args} playerNumber={playerNumber} />
    ))}
    <MicPillShell {...args} playerNumber={null} />
  </div>
);
