import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NoRemoteMics, useRemoteMicsAvailable } from '~/modules/remote-mic/no-remote-mics';

const server = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));

vi.mock('~/modules/remote-mic/network/server', () => ({ default: server }));

const Probe = () => <span>{useRemoteMicsAvailable() ? 'available' : 'unavailable'}</span>;

describe('NoRemoteMics', () => {
  beforeEach(() => {
    server.start.mockClear();
    server.stop.mockClear();
  });

  it('closes the mic server while mounted and restores it after, when it was up', () => {
    server.stop.mockReturnValue(true);

    const { unmount } = render(<NoRemoteMics>content</NoRemoteMics>);
    expect(server.stop).toHaveBeenCalledOnce();
    expect(server.start).not.toHaveBeenCalled();

    unmount();
    expect(server.start).toHaveBeenCalledOnce();
  });

  it('leaves the mic server down if it was not up to begin with', () => {
    server.stop.mockReturnValue(false);

    render(<NoRemoteMics>content</NoRemoteMics>).unmount();

    expect(server.start).not.toHaveBeenCalled();
  });

  it('tells what is inside that no phone can join', () => {
    server.stop.mockReturnValue(false);

    render(
      <>
        <Probe />
        <NoRemoteMics>
          <Probe />
        </NoRemoteMics>
      </>,
    );

    expect(screen.getAllByText(/available/).map((element) => element.textContent)).toEqual([
      'available',
      'unavailable',
    ]);
  });
});
