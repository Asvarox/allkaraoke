import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { SongPreview } from '~/interfaces';
import DrawingTestInput from '~/modules/GameEngine/Input/DrawingTestInput';
import InputManager from '~/modules/GameEngine/Input/InputManager';
import PlayersManager from '~/modules/Players/PlayersManager';
import SongPreviewComponent from '~/routes/SingASong/SongSelectionV2/Components/SongPreview';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const songPreview: SongPreview = {
  id: 'storybook-song',
  shortId: 1,
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  video: 'koBUXESJZ8g',
  videoGap: 0,
  previewStart: 60,
  previewEnd: 90,
  gap: 500,
  bpm: 200,
  realBpm: 200,
  language: ['English'],
  genre: 'Rock',
  year: '1975',
  edition: undefined,
  author: undefined,
  authorUrl: undefined,
  sourceUrl: undefined,
  artistOrigin: 'GB',
  volume: 0.5,
  manualVolume: 0.5,
  tracksCount: 1,
  tracks: [{ name: 'Main', start: 0 }],
  search: 'bohemian rhapsody queen',
  lastUpdate: undefined,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryArgs {
  /** Volume level shown in the MicCheck volume bars (0–1) */
  volume: number;
  isPopular: boolean;
}

// ---------------------------------------------------------------------------
// Setup helper — switches all PlayersManager players to DrawingTest input so
// the MicCheck panel shows "connected" indicators without requiring a real mic.
// ---------------------------------------------------------------------------

function useDrawingTestPlayers(volume: number) {
  useEffect(() => {
    PlayersManager.getPlayers().forEach((player) => {
      // 'DrawingTest' is intentionally excluded from InputSourceNames in production
      // typings (it's test-only), so we cast here. The InputManager handles it via
      // a special case in sourceNameToInput.
      player.changeInput('DrawingTest' as Parameters<typeof player.changeInput>[0], 0, 'default');
    });
    InputManager.startMonitoring();
  }, []);

  useEffect(() => {
    DrawingTestInput.setVolumes([volume, volume]);
  }, [volume]);
}

// ---------------------------------------------------------------------------
// Default meta
// ---------------------------------------------------------------------------

export default {
  title: 'Song Selection/SongPreview',
  argTypes: {
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    isPopular: { control: 'boolean' },
  },
  args: {
    volume: 0.5,
    isPopular: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<StoryArgs>;

type Story = StoryObj<StoryArgs>;

// ---------------------------------------------------------------------------
// Expanded story — the fully-expanded panel with MicCheck + GameSettings.
// This is the most useful story for iterating on the settings UI.
// ---------------------------------------------------------------------------

function ExpandedTemplate({ volume, isPopular }: StoryArgs) {
  useDrawingTestPlayers(volume);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <SongPreviewComponent
        songPreview={songPreview}
        onPlay={() => {}}
        keyboardControl={true}
        onExitKeyboardControl={() => {}}
        top={0}
        left={0}
        width={320}
        height={200}
        isPopular={isPopular}
        forceFlag={false}
        onExpand={() => {}}
      />
    </div>
  );
}

export const Expanded: Story = {
  render: (args) => <ExpandedTemplate {...args} />,
};

// ---------------------------------------------------------------------------
// Collapsed story — the floating card that appears on hover/focus in the grid.
// Rendered scaled-up inside a positioned parent that mimics the song grid.
// ---------------------------------------------------------------------------

const CARD_W = 320;
// Match the actual game formula: thumbnail (16:9) + 120 px metadata footer
const CARD_H = Math.round(CARD_W * (9 / 16) + 120);

function CollapsedTemplate({ volume, isPopular }: StoryArgs) {
  useDrawingTestPlayers(volume);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      {/* Mimic the positioned grid container the card lives inside */}
      <div style={{ position: 'relative', width: CARD_W * 3, height: CARD_H * 3 }}>
        <SongPreviewComponent
          songPreview={songPreview}
          onPlay={() => {}}
          keyboardControl={false}
          onExitKeyboardControl={() => {}}
          top={CARD_H}
          left={CARD_W}
          width={CARD_W}
          height={CARD_H}
          isPopular={isPopular}
          forceFlag={false}
          onExpand={() => {}}
        />
      </div>
    </div>
  );
}

export const Collapsed: Story = {
  render: (args) => <CollapsedTemplate {...args} />,
};

// ---------------------------------------------------------------------------
// Duet song variant
// ---------------------------------------------------------------------------

const duetSongPreview: SongPreview = {
  ...songPreview,
  id: 'storybook-duet',
  title: "Don't Stop Me Now",
  artist: 'Queen',
  tracksCount: 2,
  tracks: [
    { name: 'Lead', start: 0 },
    { name: 'Harmony', start: 0 },
  ],
  search: 'dont stop me now queen',
};

function DuetTemplate({ volume, isPopular }: StoryArgs) {
  useDrawingTestPlayers(volume);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <SongPreviewComponent
        songPreview={duetSongPreview}
        onPlay={() => {}}
        keyboardControl={true}
        onExitKeyboardControl={() => {}}
        top={0}
        left={0}
        width={320}
        height={200}
        isPopular={isPopular}
        forceFlag={false}
        onExpand={() => {}}
      />
    </div>
  );
}

export const ExpandedDuet: Story = {
  render: (args) => <DuetTemplate {...args} />,
};
