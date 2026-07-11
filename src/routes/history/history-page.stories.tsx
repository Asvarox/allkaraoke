import { Meta, StoryObj } from '@storybook/react-vite';
import { GAME_MODE, SongPreview } from '~/interfaces';
import { HistoryPageView } from './history-page-view';
import { PlayHistoryGroup } from './use-play-history';

function createSong(id: string, title: string, artist: string, video: string): SongPreview {
  return {
    shortId: Number(id.replace(/\D/g, '')) || 1,
    id,
    title,
    artist,
    video,
    tracksCount: 1,
    tracks: [{ name: 'Lead', start: 0 }],
    search: `${artist} ${title}`,
    lastUpdate: undefined,
    author: undefined,
    authorUrl: undefined,
    genre: undefined,
    year: undefined,
    edition: undefined,
    language: ['en'],
    sourceUrl: undefined,
    duration: 240,
    videoGap: 0,
    previewStart: 10,
    previewEnd: 25,
    gap: 0,
    bpm: 120,
    realBpm: 120,
    volume: undefined,
    manualVolume: undefined,
    artistOrigin: undefined,
    local: false,
  };
}

const loadedGroups: PlayHistoryGroup[] = [
  {
    label: 'Today',
    entries: [
      {
        songKey: 'fleetwood-dreams',
        song: createSong('history-song-1', 'Dreams', 'Fleetwood Mac', 'mrZRURcb1cM'),
        date: '2026-06-27T20:15:00.000Z',
        progress: 1,
        mode: GAME_MODE.DUEL,
        scores: [
          { name: 'Alex', score: 842_000 },
          { name: 'Sam', score: 816_000 },
        ],
      },
      {
        songKey: 'deleted-track',
        song: null,
        date: '2026-06-27T19:40:00.000Z',
        progress: 0.62,
        mode: GAME_MODE.PASS_THE_MIC,
        scores: [{ name: 'Jamie', score: 488_000 }],
      },
      {
        songKey: 'queen-dont-stop',
        song: createSong('history-song-2', "Don't Stop Me Now", 'Queen', 'HgzGwKwLmgM'),
        date: '2026-06-27T18:10:00.000Z',
        progress: 1,
        mode: GAME_MODE.CO_OP,
        scores: [{ name: 'Chris & Pat', score: 1_340_000 }],
      },
    ],
  },
];

export default {
  title: 'History/Page',
  component: HistoryPageView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HistoryPageView>;

type Story = StoryObj<typeof HistoryPageView>;

export const Loading: Story = {
  render: () => <HistoryPageView groups={[]} loading onBack={() => undefined} />,
};

export const Loaded: Story = {
  render: () => <HistoryPageView groups={loadedGroups} loading={false} onBack={() => undefined} />,
};

export const Empty: Story = {
  render: () => <HistoryPageView groups={[]} loading={false} onBack={() => undefined} />,
};
