import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MicAccessDeniedView from '~/modules/user-media/mic-access-denied-view';
import userMediaService from '~/modules/user-media/user-media-service';

describe('MicAccessDeniedView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('points to the OS settings instead of the site unblock video when the browser app has no mic access', () => {
    vi.spyOn(userMediaService, 'getStatus').mockReturnValue('blocked-by-system');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 14) Chrome/140.0 Mobile');

    render(<MicAccessDeniedView />);

    expect(screen.getByText(/Permissions ➔ Microphone/)).toBeInTheDocument();
    expect(screen.queryByAltText('how-to-allow-or-unblock-mic')).not.toBeInTheDocument();
  });
});
