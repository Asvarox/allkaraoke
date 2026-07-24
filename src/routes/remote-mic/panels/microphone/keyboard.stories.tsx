import { Meta, StoryFn } from '@storybook/react-vite';

import { HelpEntry } from '~/routes/keyboard-help/context';
import { ControlDescriptor } from '~/routes/keyboard-help/controls';

import { MirrorKeyboard } from './keyboard';

export default {
  title: 'Remote Mic/Mirror Keyboard',
  component: MirrorKeyboard,
} as Meta;

const buttonControls = (count: number): ControlDescriptor[] =>
  Array.from({ length: count }, (_, i) => ({
    type: 'button' as const,
    name: `control-${i}`,
    label: `Control ${i + 1}`,
  }));

const settingsKeyboard: HelpEntry = {
  mode: 'mirror',
  title: 'Settings',
  controls: [
    { type: 'switch', name: 'graphics', label: 'Graphics', value: 'HIGH' },
    { type: 'switch', name: 'fps', label: 'FPS Count', value: 'Visible' },
    { type: 'checkbox', name: 'camera', label: 'Enable camera mode', checked: true },
    ...buttonControls(8),
    { type: 'button', name: 'back', label: 'Return To Main Menu', variant: 'back' },
  ],
};

// The always-compact mic preview: mirrors VolumeIndicator's container sizing (volume-indicator.tsx)
// without its network-client chain, so the story stays renderable in isolation.
function MicPreviewPlaceholder() {
  return (
    <div className="relative h-[6.5rem] min-h-[6.5rem] w-full rounded-md border border-white bg-white/10 landscape:h-auto landscape:max-h-[300px] landscape:min-h-[200px] landscape:flex-1">
      <span className="absolute inset-0 flex items-center justify-center text-white">Mic preview</span>
      <button className="absolute right-4 bottom-4 rounded bg-white/20 p-3 text-xs text-white">Join game</button>
    </div>
  );
}

// Faithful reproduction of the remote-mic phone shell (remote-mic.tsx + microphone.tsx). Uses the real
// `h-dvh` container so resizing the Storybook viewport actually drives the portrait/landscape layout.
const PhoneShell: StoryFn<{ keyboard: HelpEntry }> = ({ keyboard }) => (
  <div className="mx-auto flex h-dvh w-full max-w-[45rem] flex-col border border-white/20">
    <div className="shrink-0 bg-slate-800 p-3 text-center text-white">Top bar</div>
    <div className="flex flex-1 flex-col justify-center overflow-hidden">
      <div className="relative flex h-full flex-col">
        <div className="text-md flex h-full min-h-0 flex-col items-center justify-center gap-2 overflow-hidden px-4 pt-4 landscape:flex-row landscape:items-stretch landscape:gap-4 landscape:py-2">
          <div className="flex w-full flex-none flex-col justify-center gap-4 landscape:flex-1">
            <MicPreviewPlaceholder />
          </div>
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center">
            <MirrorKeyboard keyboard={keyboard} />
          </div>
        </div>
      </div>
    </div>
    <div className="flex shrink-0 gap-px bg-slate-700 text-center text-xs text-white">
      {['Microphone', 'Song list', 'Settings'].map((t) => (
        <div key={t} className="flex-1 bg-black p-2">
          {t}
        </div>
      ))}
    </div>
  </div>
);

export const Settings = PhoneShell.bind({});
Settings.args = { keyboard: settingsKeyboard };

export const ShortKeyboard = PhoneShell.bind({});
ShortKeyboard.args = {
  keyboard: {
    mode: 'mirror',
    title: 'Song Settings',
    controls: [
      { type: 'switch', name: 'difficulty', label: 'Difficulty', value: 'Medium' },
      { type: 'switch', name: 'mode', label: 'Mode', value: 'Duel' },
      { type: 'button', name: 'play', label: 'Play' },
    ],
  },
};

export const PauseMenu = PhoneShell.bind({});
PauseMenu.args = {
  keyboard: {
    mode: 'mirror',
    title: 'Pause menu',
    controls: [
      { type: 'button', name: 'resume', label: 'Resume song', variant: 'back' },
      { type: 'button', name: 'restart', label: 'Restart song', icon: null },
      { type: 'button', name: 'exit', label: 'Exit song', icon: null },
      { type: 'button', name: 'mics', label: 'Microphones settings', icon: 'settings' },
      { type: 'input-lag', name: 'input-lag', label: 'Input lag', value: 100 },
      { type: 'button', name: 'edit', label: 'Edit song', icon: null },
    ],
  },
};

export const RateSong = PhoneShell.bind({});
RateSong.args = {
  keyboard: {
    mode: 'mirror',
    title: 'Rate the song',
    controls: [
      { type: 'checkbox', name: 'not-in-sync', label: 'Lyrics are not in sync', checked: false },
      { type: 'checkbox', name: 'bad-lyrics', label: 'Wrong lyrics, missing spaces etc.', checked: true },
      { type: 'checkbox', name: 'too-quiet', label: 'Too quiet', checked: false },
      { type: 'checkbox', name: 'too-loud', label: 'Too loud', checked: false },
      { type: 'button', name: 'submit', label: 'Submit and exit', icon: 'confirm' },
      { type: 'button', name: 'back', label: 'Back', variant: 'back' },
    ],
  },
};

export const HighScores = PhoneShell.bind({});
HighScores.args = {
  keyboard: {
    mode: 'mirror',
    title: 'High scores',
    controls: [
      { type: 'text', name: 'rename', label: 'Rename', value: '', placeholder: 'E-Ray' },
      { type: 'button', name: 'select-song', label: 'Select song' },
    ],
  },
};

export const SkipIntro = PhoneShell.bind({});
SkipIntro.args = {
  keyboard: {
    mode: 'mirror',
    title: 'Skip intro',
    controls: [
      { type: 'button', name: 'skip-intro', label: 'Skip intro' },
      { type: 'button', name: 'pause', label: 'Pause menu', variant: 'back' },
    ],
  },
};
