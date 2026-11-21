import posthog from 'posthog-js';

import { Song } from '~/interfaces';
import { OnlineRoomState } from '~/modules/online/protocol/types';

import { recordOnlineSongProgress, trackOnlineSongEnded, trackOnlineSongStarted } from './online-analytics';

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }));

const roomState = {
  roomCode: 'ROOM',
  tolerance: 2,
  participants: [{}, {}],
  leaderboard: [],
} as unknown as OnlineRoomState;
const song = { id: 'song-1', artist: 'Artist', title: 'Title' } as Song;

const captured = (event: string) =>
  vi
    .mocked(posthog.capture)
    .mock.calls.filter(([name]) => name === event)
    .map(([, properties]) => properties);

beforeEach(() => {
  vi.mocked(posthog.capture).mockClear();
});

describe('online song analytics', () => {
  it('sends the progress and the same singId on songEnded as on songStarted', () => {
    trackOnlineSongStarted(roomState, song);
    recordOnlineSongProgress('song-1', 0.42);
    trackOnlineSongEnded(roomState, song);

    const [started] = captured('songStarted');
    const [ended] = captured('songEnded');
    expect(ended).toMatchObject({ progress: 0.42, singId: started?.singId, playMode: 'online' });
    expect(started?.singId).toEqual(expect.any(String));
  });

  it('ignores progress recorded for another song', () => {
    trackOnlineSongStarted(roomState, song);
    recordOnlineSongProgress('other-song', 0.9);
    trackOnlineSongEnded(roomState, song);

    expect(captured('songEnded')[0]).toMatchObject({ progress: null });
  });

  it('sends no progress when this tab did not start the song (host changed mid-song)', () => {
    trackOnlineSongEnded(roomState, { ...song, id: 'never-started' } as Song);

    expect(captured('songEnded')[0]).toMatchObject({ progress: null, singId: null });
  });
});
