import { renderHook } from '@testing-library/react';
import { act, FunctionComponent, PropsWithChildren } from 'react';
import { describe, expect, it, vitest } from 'vitest';
import events from '~/modules/game-events/game-events';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { HelpEntry } from '~/routes/keyboard-help/context';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';

vitest.mock('~/modules/sound-manager', () => ({
  menuBack: { play: vitest.fn() },
  menuEnter: { play: vitest.fn() },
  menuNavigate: { play: vitest.fn() },
}));

// Captures every HelpEntry the hook publishes so we can assert on the layout sent to remote mics.
// useKeyboardHelp registers via setKeyboard and refreshes content via updateKeyboard, so we capture both.
function setup(register: (nav: ReturnType<typeof useKeyboardNav>) => void) {
  const published: HelpEntry[] = [];
  const record = (_name: string, help: HelpEntry) => {
    published.push(help);
  };
  const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <KeyboardHelpContext
      value={{ setKeyboard: record, updateKeyboard: record, unsetKeyboard: () => {}, hasContent: false }}>
      {children}
    </KeyboardHelpContext>
  );

  const rendered = renderHook(
    () => {
      const nav = useKeyboardNav({ onBackspace: () => {} });
      register(nav);
      return nav;
    },
    { wrapper },
  );

  return { published, ...rendered };
}

const last = (published: HelpEntry[]) => published.at(-1)!;

describe('useKeyboardNav mirror mode', () => {
  it('emits mirror controls when every element supplies a descriptor', () => {
    const { published } = setup((nav) => {
      nav.register('graphics', () => {}, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      nav.register('camera', () => {}, 'Camera', false, {
        control: { type: 'checkbox', label: 'Camera', checked: true },
      });
      nav.register('back', () => {}, 'Back', false, {
        control: { type: 'button', label: 'Back' },
      });
    });

    const help = last(published);
    expect(help.mode).toBe('mirror');
    expect(help.controls).toBeDefined();
    expect(help.controls).toEqual([
      { type: 'switch', name: 'graphics', label: 'Graphics', value: 'HIGH' },
      { type: 'checkbox', name: 'camera', label: 'Camera', checked: true },
      { type: 'button', name: 'back', label: 'Back' },
    ]);
    // Mirror mode is mutually exclusive with the classic arrow fields.
    expect(help.vertical).toBeUndefined();
    expect(help.accept).toBeUndefined();
  });

  it('falls back to the classic arrow layout when coverage is partial', () => {
    const { published } = setup((nav) => {
      nav.register('graphics', () => {}, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      // No descriptor — breaks all-or-nothing coverage.
      nav.register('plain-button', () => {}, 'Plain');
    });

    const help = last(published);
    expect(help.mode).toBe('classic');
    expect(help.controls).toBeUndefined();
    expect(help.vertical).toBeNull(); // classic navigation field present
  });

  it('activates the matching control callback on remoteControlActivated', () => {
    const onGraphics = vitest.fn();
    const onCamera = vitest.fn();
    setup((nav) => {
      nav.register('graphics', onGraphics, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      nav.register('camera', onCamera, 'Camera', false, {
        control: { type: 'checkbox', label: 'Camera', checked: false },
      });
    });

    act(() => {
      events.remoteControlActivated.dispatch('camera');
    });

    expect(onCamera).toHaveBeenCalledTimes(1);
    expect(onGraphics).not.toHaveBeenCalled();
  });
});
