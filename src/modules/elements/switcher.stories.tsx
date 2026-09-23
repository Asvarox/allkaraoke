import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useEffect, useState } from 'react';

import { ButtonSize } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Switcher } from './switcher';

/** Clicking a switcher cycles to the next value in its list — it never opens a menu. */
function DemoSwitcher({
  values,
  ...props
}: Omit<ComponentProps<typeof Switcher>, 'value' | 'onClick'> & {
  values: string[];
}) {
  const [index, setIndex] = useState(0);

  return (
    <Switcher {...props} value={values[index]} onClick={() => setIndex((current) => (current + 1) % values.length)} />
  );
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Hardcore'];
const SIZES: ButtonSize[] = ['mini', 'small', 'regular', 'large'];

function GalleryTemplate() {
  return (
    <StoryPage
      title="Switcher"
      description="A one-line setting that cycles through its options on click. The label is never truncated and keeps its natural width; the value takes the rest and crossfades whenever it changes.">
      <StorySection title="Sizes" description="Defaults to `small` — the size a settings menu row uses.">
        {SIZES.map((size) => (
          <DemoSwitcher key={size} size={size} label={size} values={DIFFICULTIES} className="w-full" />
        ))}
      </StorySection>

      <StorySection
        title="States"
        description="Only one row per screen carries the cursor, so only one here is `focused`.">
        <DemoSwitcher label="Resting" values={DIFFICULTIES} className="w-full" />
        <DemoSwitcher label="Focused" values={DIFFICULTIES} className="w-full" focused />
        {/* The switcher isn't a `<button>` at heart, so it carries `data-disabled` rather than the
            real attribute — `ButtonBase` reads both, and greys and deadens the row either way. */}
        <DemoSwitcher label="Disabled" values={DIFFICULTIES} className="w-full" disabled />
        <Switcher label="Read only" value="Duel" className="w-full" readOnly />
        {/* Inert on purpose: the value isn't known yet, so the click does nothing. */}
        <Switcher label="Loading" value={undefined} className="w-full" loading />
      </StorySection>

      <StorySection
        title="Value"
        description="Whatever's left after the label — truncated with an ellipsis, never wrapped.">
        <Switcher label="Short" value="Duel" className="w-full" />
        <Switcher
          label="Long"
          value="Realtek High Definition Audio — Microphone Array (Front panel)"
          className="w-full"
        />
        <Switcher label="Numeric" value={120} className="w-full" />
        <Switcher label="Empty" value={null} className="w-full" />
        {/* `displayValue` renders in place of `value`, while `value` stays the crossfade key. */}
        <Switcher
          label="Display value"
          value="on"
          displayValue={
            <span className="inline-flex items-center gap-1">
              <Icon icon="ic:baseline-check" size={5} /> Enabled
            </span>
          }
          className="w-full"
        />
      </StorySection>

      <StorySection title="Info" description="Helper text under the row, rendered by `InputWrapper`.">
        <DemoSwitcher
          label="Mic"
          values={['Built-in microphone', 'Remote microphone']}
          className="w-full"
          info="Every player needs their own microphone."
        />
      </StorySection>

      <StorySection
        title="Children"
        description="Anything passed as children lands inside the row, after the value — this is where the mic-check meter goes.">
        <DemoSwitcher label="Mic" values={['Built-in microphone', 'Remote microphone']} className="w-full">
          <span className="ml-2 inline-flex h-5 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs">
            meter
          </span>
        </DemoSwitcher>
      </StorySection>
    </StoryPage>
  );
}

/**
 * The switcher is a fixed height whether or not it has a value yet, so a screen can render it from
 * the start: the placeholder bar is a crossfade state of its own, and the real value slides in on
 * top of it rather than growing a control into the layout.
 */
function LoadingTemplate() {
  const [mic, setMic] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setMic('Built-in microphone'), 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <StoryPage
      title="Switcher — loading"
      description="The value resolves after two seconds. Reload the story to watch the placeholder hand over again.">
      <StorySection title="Placeholder to value">
        <Switcher label="Mic" value={mic} loading={mic === null} className="w-full" />
      </StorySection>
      <StorySection title="Side by side" description="Same height either way — nothing moves when the value arrives.">
        <Switcher label="Mic" value={undefined} loading className="w-full" />
        <Switcher label="Mic" value="Built-in microphone" className="w-full" />
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  const [online, setOnline] = useState(false);

  return (
    <StoryPage
      title="Switcher — in context"
      description="A settings menu is a column of switchers: labels line up, values right-align against them.">
      <StorySection title="Game settings">
        <DemoSwitcher label="Difficulty" values={DIFFICULTIES} className="w-full" focused />
        {/* Online play is locked to Duel, so the mode reads as display-only rather than as a
            control the host can cycle. */}
        {online ? (
          <Switcher label="Mode" value="Duel" className="w-full" readOnly />
        ) : (
          <DemoSwitcher label="Mode" values={['Duel', 'Pass The Mic', 'Co-op']} className="w-full" />
        )}
        <DemoSwitcher label="Players" values={['1', '2', '3', '4']} className="w-full" />
        <Switcher
          label="Online"
          value={online ? 'Yes' : 'No'}
          className="w-full"
          onClick={() => setOnline((current) => !current)}
          info={online ? 'Mode is locked to Duel while playing online.' : undefined}
        />
      </StorySection>

      <StorySection title="Mic setup" description="The value loads asynchronously, so the row starts as a placeholder.">
        <Switcher label="Mic" value={undefined} loading className="w-full" />
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Switcher',
  component: Switcher,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Switcher>;

type Story = StoryObj<typeof Switcher>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const Loading: Story = {
  render: () => <LoadingTemplate />,
  // The handover is on a timer, so a screenshot of this story would race it. The Gallery and the
  // side-by-side section below already cover both states as stills.
  tags: ['no-screenshot'],
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
