import { afterEach, describe, expect, it, vi } from 'vitest';

import userMediaService from '~/modules/user-media/user-media-service';

const rejectGetUserMedia = (error: Error) => {
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(error) } });
};

describe('userMediaService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports a site-level denial as declined', async () => {
    rejectGetUserMedia(new DOMException('Permission denied', 'NotAllowedError'));

    await expect(userMediaService.getUserMedia({ audio: true })).rejects.toThrow();
    expect(userMediaService.getStatus()).toBe('declined');
  });

  it('reports an OS-level denial of the browser app as blocked-by-system', async () => {
    rejectGetUserMedia(new DOMException('Permission denied by system', 'NotAllowedError'));

    await expect(userMediaService.getUserMedia({ audio: true })).rejects.toThrow();
    expect(userMediaService.getStatus()).toBe('blocked-by-system');
  });
});
