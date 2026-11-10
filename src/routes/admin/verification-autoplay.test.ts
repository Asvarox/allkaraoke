import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('verification autoplay', () => {
  let module: typeof import('./verification-autoplay');

  beforeEach(async () => {
    vi.resetModules();
    module = await import('./verification-autoplay');
  });

  const openSong = () => renderHook(() => module.useVerificationAutoplay(true));

  it('does not autoplay the first opened song', () => {
    const { result } = openSong();

    expect(result.current).toBe(false);
  });

  it('autoplays the next song after saving', () => {
    const first = openSong();
    module.armVerificationAutoplay();
    first.unmount();

    expect(openSong().result.current).toBe(true);
  });

  it('keeps autoplaying subsequent songs', () => {
    const first = openSong();
    module.armVerificationAutoplay();
    first.unmount();
    const second = openSong();
    module.armVerificationAutoplay();
    second.unmount();

    expect(openSong().result.current).toBe(true);
  });

  it('resets to manual play when the window gets blurred', () => {
    const first = openSong();
    window.dispatchEvent(new Event('blur'));
    module.armVerificationAutoplay();
    first.unmount();

    expect(openSong().result.current).toBe(false);
  });

  it('resets to manual play when blurred after saving', () => {
    const first = openSong();
    module.armVerificationAutoplay();
    window.dispatchEvent(new Event('blur'));
    first.unmount();

    expect(openSong().result.current).toBe(false);
  });

  it('autoplays again after the reset song is saved', () => {
    const first = openSong();
    window.dispatchEvent(new Event('blur'));
    module.armVerificationAutoplay();
    first.unmount();
    const second = openSong();
    module.armVerificationAutoplay();
    second.unmount();

    expect(openSong().result.current).toBe(true);
  });

  it('ignores blur caused by focusing the video iframe', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(iframe);

    const first = openSong();
    window.dispatchEvent(new Event('blur'));
    module.armVerificationAutoplay();
    first.unmount();
    vi.restoreAllMocks();
    iframe.remove();

    expect(openSong().result.current).toBe(true);
  });

  it('does not autoplay outside of the processing queue', () => {
    const first = openSong();
    module.armVerificationAutoplay();
    first.unmount();

    expect(renderHook(() => module.useVerificationAutoplay(false)).result.current).toBe(false);
  });
});
