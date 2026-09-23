import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ComponentRef, ReactNode, useRef, useState } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';

import { Input } from './input';

function Page({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="text-default flex min-h-screen justify-center bg-slate-950 p-8">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-default/60 text-sm">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        {description && <p className="text-default/60 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * `Input` is fully controlled, so every story needs an owner for the value. Note `focused` is the
 * *game's* cursor (the one a remote or the arrow keys move), not DOM focus: it paints the control
 * as the selected one, and while it's set any letter key drops the caret into the field.
 */
function DemoInput({
  initialValue = '',
  focused = false,
  ...props
}: Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'focused'> & {
  initialValue?: string;
  focused?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return <Input {...props} focused={focused} value={value} onChange={setValue} />;
}

/** A field only comes in the two short Button sizes — see `InputSize`. */
const SIZES = ['mini', 'small'] as const satisfies ComponentProps<typeof Input>['size'][];

function GalleryTemplate() {
  return (
    <Page
      title="Input"
      description="A text field built on the same surface as the kit's buttons: the label keeps its natural width on the left, the caret takes the rest, and the whole control is the click target.">
      <Section
        title="Sizes"
        description="The two short Button sizes. Defaults to `small`; the taller ones would turn a line of text into a target to aim at.">
        {SIZES.map((size) => (
          <DemoInput key={size} size={size} label={size} initialValue="Type here" />
        ))}
      </Section>

      <Section
        title="States"
        description="Only one field per screen is ever `focused`, so only one here is — a focused field claims the letter keys.">
        <DemoInput label="Resting" initialValue="Not selected" />
        <DemoInput label="Focused" initialValue="Selected by the cursor" focused />
        <DemoInput label="Disabled" initialValue="Can't be edited" disabled />
        {/* Read-only is disabled that still has something to say: as inert as a disabled field —
            no caret, no hover, no typing — but the value stays legible instead of greying out. */}
        <DemoInput label="Read only" initialValue="Duel" readOnly />
        <DemoInput label="Empty" placeholder="Placeholder text" />
      </Section>

      <Section title="Label" description="Any node — a word, an icon, or nothing at all.">
        <DemoInput label="Name" initialValue="Adam" />
        <DemoInput label={<Icon icon="ic:baseline-search" size={6} />} placeholder="Search…" />
        <DemoInput label="" placeholder="No label" />
      </Section>

      <Section
        title="Adornment"
        description="A trailing slot for controls that belong to the field itself. Pressing one never blurs the field.">
        <DemoInput
          label="Search"
          initialValue="Bohemian Rhapsody"
          adornment={<Input.IconButton icon="ic:baseline-close" aria-label="Clear" />}
        />
        <DemoInput
          label="Message"
          initialValue="Nice one!"
          adornment={<Input.IconButton icon="ic:baseline-send" aria-label="Send" />}
        />
        {/* `disabled` on the icon button mutes it rather than hiding it: a control that only shows
            up once it becomes usable never gets the chance to say what it is. */}
        <DemoInput
          label="Message"
          placeholder="Nothing to send yet"
          adornment={<Input.IconButton icon="ic:baseline-send" aria-label="Send" disabled />}
        />
        <DemoInput label="Input lag" initialValue="120" adornment="ms" />
      </Section>

      <Section
        title="Button inside the field"
        description="`Input.Button` when the action needs a word rather than an icon. It runs one size below the field it sits in, and wears the active fill — it's the one thing in the field that acts on its own.">
        <DemoInput size="small" label="Small" initialValue="Room code" adornment={<Input.Button>Join</Input.Button>} />
        <DemoInput
          size="small"
          label="Disabled"
          initialValue="Room code"
          adornment={<Input.Button disabled>Join</Input.Button>}
        />
      </Section>

      <Section title="Info" description="Helper text under the field, rendered by `InputWrapper`.">
        <DemoInput label="Nickname" initialValue="Singer123" info="Shown on the leaderboard." />
      </Section>
    </Page>
  );
}

/**
 * The error isn't a prop — the field is told about it from the outside (a failed submit), shows it
 * for 4 seconds, then clears itself. The story drives it through the ref exactly like a form does.
 */
function ValidationErrorTemplate() {
  const inputRef = useRef<ComponentRef<typeof Input>>(null);
  const [value, setValue] = useState('');

  const submit = () => {
    if (value.length < 4) {
      inputRef.current?.triggerValidationError('Provide a valid game code');
      inputRef.current?.element?.focus();
    }
  };

  return (
    <Page
      title="Input — validation error"
      description="Submit with fewer than 4 characters to trigger it. The outline and the message fade out on their own after 4 seconds.">
      <Section title="Imperative error">
        <Input
          ref={inputRef}
          focused={false}
          label="Game code"
          placeholder="____"
          value={value}
          onChange={setValue}
          maxLength={4}
          autoCapitalize="characters"
          autoComplete="off"
        />
        {/* Extra bottom room: the message is absolutely positioned under the field, so a tight
            container would clip it. */}
        <div className="pt-6">
          <Menu.Button size="small" onClick={submit}>
            Submit
          </Menu.Button>
        </div>
      </Section>
    </Page>
  );
}

function UseCasesTemplate() {
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('Queen');
  const [name, setName] = useState('Adam');

  return (
    <Page title="Input — in context" description="How the field is actually dressed at its three main call sites.">
      <Section title="Game code" description="Remote-mic connection: wide letter spacing, centred, capped length.">
        <Input
          className="[&_input]:text-center [&_input]:tracking-[1.25rem] [&_input]:uppercase"
          label="Game code"
          placeholder="_____"
          value={code}
          onChange={setCode}
          maxLength={5}
          autoCapitalize="characters"
          autoComplete="off"
          focused={false}
        />
      </Section>

      <Section title="Song search" description="Remote song list toolbar: `mini`, icon for a label, clear button.">
        <Input
          size="mini"
          className="w-full text-sm"
          focused={false}
          label={<Icon icon="ic:baseline-search" size={4} />}
          placeholder="Search the list…"
          value={search}
          onChange={setSearch}
          adornment={
            <Input.IconButton icon="ic:baseline-close" aria-label="Close search" onClick={() => setSearch('')} />
          }
        />
      </Section>

      <Section title="Leaderboard name" description="Post-game identity field: focused by the cursor, length-capped.">
        <Input label="Name" value={name} onChange={setName} maxLength={16} focused info="Max 16 characters." />
      </Section>
    </Page>
  );
}

export default {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof Input>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const ValidationError: Story = {
  render: () => <ValidationErrorTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
