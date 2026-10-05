import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SimplifiedMic from '~/modules/game-engine/input/simplified-mic';
import userMediaService from '~/modules/user-media/user-media-service';

vi.mock('posthog-js', () => ({ default: { captureException: vi.fn() } }));

const createStream = () => {
  const track = { readyState: 'live', stop: vi.fn(() => (track.readyState = 'ended')) };
  return {
    track,
    stream: { getTracks: () => [track], getAudioTracks: () => [track] } as unknown as MediaStream,
  };
};

describe('SimplifiedMic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Audio processing isn't available in happy-dom - only the stream handling is under test
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => {
        throw new Error('no audio');
      }),
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await SimplifiedMic.stopMonitoring();
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reuses the stream when the host restarts monitoring, so the browser does not prompt again', async () => {
    const { stream, track } = createStream();
    const getUserMedia = vi.spyOn(userMediaService, 'getUserMedia').mockResolvedValue(stream);

    await SimplifiedMic.startMonitoring();
    await SimplifiedMic.stopMonitoring();
    await vi.advanceTimersByTimeAsync(5_000);
    await SimplifiedMic.startMonitoring();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(track.stop).not.toHaveBeenCalled();
  });

  it('releases the stream once monitoring stays stopped', async () => {
    const first = createStream();
    const second = createStream();
    const getUserMedia = vi
      .spyOn(userMediaService, 'getUserMedia')
      .mockResolvedValueOnce(first.stream)
      .mockResolvedValueOnce(second.stream);

    await SimplifiedMic.startMonitoring();
    await SimplifiedMic.stopMonitoring();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(first.track.stop).toHaveBeenCalled();

    await SimplifiedMic.startMonitoring();
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('hands the wizard probe stream over to monitoring instead of asking again', async () => {
    const { stream } = createStream();
    const getUserMedia = vi.spyOn(userMediaService, 'getUserMedia').mockResolvedValue(stream);

    await SimplifiedMic.requestAccess();
    await vi.advanceTimersByTimeAsync(10_000);
    await SimplifiedMic.startMonitoring();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('releases the probe stream when monitoring never starts', async () => {
    const { stream, track } = createStream();
    vi.spyOn(userMediaService, 'getUserMedia').mockResolvedValue(stream);

    await SimplifiedMic.requestAccess();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(track.stop).toHaveBeenCalled();
  });
});
