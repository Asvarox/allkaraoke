import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { act } from 'react';
import { afterEach } from 'vitest';
import { ClosableTooltip } from '~/modules/Elements/Tooltip';

describe('Tooltip', () => {
  const baseProps = {
    dismissKey: 'dismissKey',
    title: 'title',
    children: <div>children</div>,
  };

  describe('ClosableTooltip', () => {
    beforeEach(() => {
      global.localStorage.clear();
    });

    afterEach(() => {
      vitest.useRealTimers();
    });

    it('should not open again when closed', async () => {
      const props = { ...baseProps, oneTime: true };

      const { unmount } = render(<ClosableTooltip {...props} />);

      await act(async () => userEvent.click(await screen.findByText('Close')));
      expect(screen.queryByText('title')).toBeNull();

      unmount();
      render(<ClosableTooltip {...props} />);
      await screen.findByText('children');
      expect(screen.queryByText('title')).toBeNull();
    });

    it('should not open again when closed unless hovered when oneTime is off', async () => {
      const props = { ...baseProps, oneTime: false };
      const { unmount } = render(<ClosableTooltip {...props} />);

      await act(async () => userEvent.click(await screen.findByText('Close')));
      expect(screen.queryByText('title')).toBeNull();

      unmount();
      render(<ClosableTooltip {...props} />);
      await userEvent.hover(await screen.findByText('children'));
      await screen.findByText('title');
      expect(screen.queryByText('Close')).toBeNull();
    });

    it('open prop should override the controlled component variant', async () => {
      const props = { ...baseProps, oneTime: false, open: false };
      render(<ClosableTooltip {...props} />);

      await userEvent.hover(await screen.findByText('children'));
      expect(screen.queryByText('title')).toBeNull();
    });

    it('open prop should override the uncontrolled component variant', async () => {
      const props = { ...baseProps, oneTime: false, open: true };
      render(<ClosableTooltip {...props} />);
      await act(async () => userEvent.click(await screen.findByText('Close')));

      await userEvent.hover(await screen.findByText('children'));
      await screen.findByText('title');
    });

    it('should auto close the tooltip after a timeout', async () => {
      const props = { ...baseProps, timeoutMs: 10_000 };
      vitest.useFakeTimers();
      render(<ClosableTooltip {...props} />);
      await act(async () => vitest.runAllTimersAsync());
      expect(screen.queryByText('title')).toBeNull();
    });
  });
});
