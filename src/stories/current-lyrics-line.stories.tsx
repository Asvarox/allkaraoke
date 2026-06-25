import { Meta, StoryFn, StoryObj } from '@storybook/react-vite';
import { Note, NotesSection } from '~/interfaces';
import styles from '~/modules/game-engine/drawing/styles';
import CurrentLyricsLine from '~/routes/game/singing/game-overlay/components/lyrics/current-lyrics-line';

type StoryPlayerNumber = 0 | 1 | 2 | 3;

interface StoryArgs {
  playerNumber: StoryPlayerNumber;
  sectionProgress: number;
  effectsEnabled: boolean;
}

const hardcodedNotes: Note[] = [
  { start: 0, length: 1, pitch: 5, type: 'normal', lyrics: 'I ' },
  { start: 1, length: 1, pitch: 5, type: 'normal', lyrics: 'set ' },
  { start: 2, length: 1, pitch: 5, type: 'normal', lyrics: 'the ' },
  { start: 3, length: 1, pitch: 5, type: 'normal', lyrics: 'fi' },
  { start: 4, length: 1, pitch: 6, type: 'normal', lyrics: 're ' },
  { start: 5, length: 1, pitch: 5, type: 'normal', lyrics: 'to ' },
  { start: 6, length: 1, pitch: 5, type: 'normal', lyrics: 'the ' },
  { start: 7, length: 1, pitch: 5, type: 'normal', lyrics: 'ra' },
  { start: 8, length: 1, pitch: 6, type: 'normal', lyrics: '~in ' },
];

const hardcodedSection: NotesSection = {
  type: 'notes',
  start: 0,
  notes: hardcodedNotes,
};

const getSectionEndBeat = (section: NotesSection) =>
  section.notes.reduce((maxBeat, note) => Math.max(maxBeat, note.start + note.length), section.start);

const getCurrentBeat = (section: NotesSection, sectionProgress: number) => {
  const sectionEndBeat = getSectionEndBeat(section);
  const sectionLength = sectionEndBeat - section.start;
  const normalizedProgress = Math.max(0, Math.min(100, sectionProgress));

  return section.start + (sectionLength * normalizedProgress) / 100;
};

const CurrentLyricsLinePreview = (args: StoryArgs) => {
  const currentBeat = getCurrentBeat(hardcodedSection, args.sectionProgress);
  const playerColor = styles.colors.players[args.playerNumber].text;

  return (
    <div style={{ width: 900, background: 'rgba(0,0,0,0.75)', padding: '1rem' }}>
      <CurrentLyricsLine
        playerNumber={args.playerNumber}
        section={hardcodedSection}
        currentBeat={currentBeat}
        playerColor={playerColor}
        effectsEnabled={args.effectsEnabled}
        showSwap={false}
        playSessionId="storybook-play"
      />
    </div>
  );
};

export default {
  title: 'Game/Singing/CurrentLyricsLine',
  component: CurrentLyricsLinePreview,
  argTypes: {
    playerNumber: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    sectionProgress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    effectsEnabled: { control: { type: 'boolean' } },
  },
  args: {
    playerNumber: 0,
    sectionProgress: 35,
    effectsEnabled: true,
  },
} satisfies Meta<StoryArgs>;

const Template: StoryFn<StoryArgs> = (args) => <CurrentLyricsLinePreview {...args} />;

type Story = StoryObj<StoryArgs>;

export const Preview = {
  render: Template,
} satisfies Story;
