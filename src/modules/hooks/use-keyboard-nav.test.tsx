import { render, renderHook, waitFor } from '@testing-library/react';
import { act, FunctionComponent, PropsWithChildren, useState } from 'react';
import { describe, expect, it, vitest } from 'vitest';

import events from '~/modules/game-events/game-events';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
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

/**
 * Renders a screen whose mirrored control lives in a CHILD component that owns the control's state,
 * which is how the pause menu drives rate-song: `useKeyboardNav` sits in the parent, but the
 * checkbox's `checked` is state inside the child. Returns a toggle for that child-only state.
 */
function setupChildOwnedControl() {
  const published: HelpEntry[] = [];
  const record = (_name: string, help: HelpEntry) => {
    published.push(help);
  };
  let toggle = () => {};

  const Child = ({ nav }: { nav: RegisterFunc }) => {
    const [checked, setChecked] = useState(false);
    toggle = () => setChecked((current) => !current);
    nav('issue', () => {}, 'Issue', false, { control: { type: 'checkbox', label: 'Issue', checked } });
    return null;
  };

  const Screen = () => {
    const { register } = useKeyboardNav();
    return <Child nav={register} />;
  };

  render(
    <KeyboardHelpContext
      value={{ setKeyboard: record, updateKeyboard: record, unsetKeyboard: () => {}, hasContent: false }}>
      <Screen />
    </KeyboardHelpContext>,
  );

  return { published, toggle: () => toggle() };
}

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
    // Mirror mode still carries the on-screen arrow/accept hint — local arrow-key navigation
    // keeps working on mirror-mode screens even though the phone gets the mirrored controls instead.
    expect(help.vertical).toBeNull();
    expect(help.accept).toBe('Graphics'); // label of the currently-selected (first registered) element
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

  it('keeps full coverage when a remote-only control is added alongside the on-screen ones', () => {
    const { published, result } = setup((nav) => {
      nav.register('graphics', () => {}, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      // Remote-only: no on-screen element, so it must not count against the coverage tally.
      nav.register('exit', () => {}, 'Exit', false, {
        remoteOnly: true,
        control: { type: 'button', label: 'Exit', variant: 'back' },
      });
    });

    const help = last(published);
    expect(help.mode).toBe('mirror');
    expect(help.controls).toEqual([
      { type: 'switch', name: 'graphics', label: 'Graphics', value: 'HIGH' },
      { type: 'button', name: 'exit', label: 'Exit', variant: 'back' },
    ]);
    // It takes no part in on-screen navigation, so focus stays on the single real element.
    expect(result.current.focused).toBe('graphics');
  });

  it('fires a remote-only control without moving on-screen focus onto it', () => {
    const onExit = vitest.fn();
    const { result } = setup((nav) => {
      nav.register('graphics', () => {}, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      nav.register('exit', onExit, 'Exit', false, {
        remoteOnly: true,
        control: { type: 'button', label: 'Exit', variant: 'back' },
      });
    });

    act(() => {
      events.remoteControlActivated.dispatch('exit');
    });

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(result.current.focused).toBe('graphics');
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

  it('stays in mirror mode when an on-screen control opts out with hideOnRemote', () => {
    const { published } = setup((nav) => {
      nav.register('graphics', () => {}, 'Graphics', false, {
        control: { type: 'switch', label: 'Graphics', value: 'HIGH' },
      });
      // On screen and arrow-navigable, but deliberately absent from the phone — it must not count as
      // missing coverage and knock the screen back to the classic arrow pad.
      nav.register('edit-song', () => {}, 'Edit song', false, { hideOnRemote: true });
    });

    const help = last(published);
    expect(help.mode).toBe('mirror');
    expect(help.controls).toEqual([{ type: 'switch', name: 'graphics', label: 'Graphics', value: 'HIGH' }]);
  });

  it('republishes when a control whose state lives in a child component changes', async () => {
    const { published, toggle } = setupChildOwnedControl();

    expect(last(published).controls).toEqual([{ type: 'checkbox', name: 'issue', label: 'Issue', checked: false }]);

    // Only the child re-renders here — the component holding useKeyboardNav does not. The mirrored
    // set still has to follow, or the phone keeps showing the stale value (the on-screen menu, which
    // renders from the child's own state, updates either way and hides the problem). `async` act so
    // the microtask the republish is deferred to gets flushed.
    await act(async () => toggle());

    await waitFor(() =>
      expect(last(published).controls).toEqual([{ type: 'checkbox', name: 'issue', label: 'Issue', checked: true }]),
    );

    // And back again — the original report was that selecting worked but deselecting did not.
    await act(async () => toggle());

    await waitFor(() =>
      expect(last(published).controls).toEqual([{ type: 'checkbox', name: 'issue', label: 'Issue', checked: false }]),
    );
  });

  it('routes a value pushed from the remote to the matching control onValueChange', () => {
    const onRename = vitest.fn();
    setup((nav) => {
      nav.register('rename', () => {}, 'Rename', false, {
        control: { type: 'text', label: 'Rename', value: '' },
        onValueChange: onRename,
      });
      nav.register('select', () => {}, 'Select', true, {
        control: { type: 'button', label: 'Select song' },
      });
    });

    act(() => {
      events.remoteControlValueChanged.dispatch('rename', 'New name');
    });

    expect(onRename).toHaveBeenCalledExactlyOnceWith('New name');
  });

  it('drops a value callback once its control is no longer registered', () => {
    const onRename = vitest.fn();
    let renameRegistered = true;
    const { rerender } = setup((nav) => {
      if (renameRegistered) {
        nav.register('rename', () => {}, 'Rename', false, {
          control: { type: 'text', label: 'Rename', value: '' },
          onValueChange: onRename,
        });
      }
      nav.register('select', () => {}, 'Select', true, {
        control: { type: 'button', label: 'Select song' },
      });
    });

    renameRegistered = false;
    rerender();

    // A value edit can reach the host long after the screen moved on — it must not write to a
    // control that is no longer on screen.
    act(() => {
      events.remoteControlValueChanged.dispatch('rename', 'Late edit');
    });

    expect(onRename).not.toHaveBeenCalled();
  });

  it('emits text and input-lag descriptors with full coverage', () => {
    const { published } = setup((nav) => {
      nav.register('rename', () => {}, 'Rename', false, {
        control: { type: 'text', label: 'Rename', value: 'E-Ray', placeholder: 'Player 1' },
        onValueChange: () => {},
      });
      nav.register('input-lag', () => {}, 'Input lag', false, {
        control: { type: 'input-lag', label: 'Input lag', value: 150 },
      });
    });

    const help = last(published);
    expect(help.mode).toBe('mirror');
    expect(help.controls).toEqual([
      { type: 'text', name: 'rename', label: 'Rename', value: 'E-Ray', placeholder: 'Player 1' },
      { type: 'input-lag', name: 'input-lag', label: 'Input lag', value: 150 },
    ]);
  });
});

describe('useKeyboardNav columns', () => {
  // Registers every name in its column, in the order given
  function setupColumns(columns: Record<string, number>) {
    return renderHook(() => {
      const nav = useKeyboardNav({ direction: 'horizontal-vertical' });
      Object.entries(columns).forEach(([name, column]) => nav.register(name, () => {}, name, false, { column }));
      return nav;
    });
  }
  const press = (key: 'up' | 'down' | 'left' | 'right') => act(() => events.remoteKeyboardPressed.dispatch(key));

  it('keeps Up/Down inside the selected column, wrapping within it', () => {
    const { result } = setupColumns({ a: 0, b: 0, c: 0, side: 1 });

    press('down');
    press('down');
    expect(result.current.focused).toBe('c');
    press('down');
    expect(result.current.focused).toBe('a');
    press('up');
    expect(result.current.focused).toBe('c');
  });

  it('moves between columns with Left/Right, wrapping past the last one', () => {
    const { result } = setupColumns({ a: 0, b: 0, middle: 1, right: 2 });

    press('right');
    expect(result.current.focused).toBe('middle');
    press('right');
    expect(result.current.focused).toBe('right');
    press('right');
    expect(result.current.focused).toBe('a');
    press('left');
    expect(result.current.focused).toBe('right');
  });

  it('lands at the same position in the next column, clamped to its length', () => {
    const { result } = setupColumns({ a: 0, b: 0, c: 0, x: 1, y: 1 });

    press('down');
    press('right');
    expect(result.current.focused).toBe('y');

    act(() => result.current.focusElement('c'));
    press('right');
    expect(result.current.focused).toBe('y');
  });

  it('returns to where the selection last was when coming back to a column', () => {
    const { result } = setupColumns({ mics: 0, difficulty: 1, mode: 1, play: 1 });

    act(() => result.current.focusElement('play'));
    press('left');
    expect(result.current.focused).toBe('mics');
    press('right');
    expect(result.current.focused).toBe('play');
  });

  it('walks a single column with Left/Right too', () => {
    const { result } = setupColumns({ a: 0, b: 0, c: 0 });

    press('right');
    expect(result.current.focused).toBe('b');
    press('left');
    press('left');
    expect(result.current.focused).toBe('c');
  });

  it('puts controls without a column in the first one', () => {
    const { result } = renderHook(() => {
      const nav = useKeyboardNav({ direction: 'horizontal-vertical' });
      nav.register('a', () => {});
      nav.register('side', () => {}, undefined, false, { column: 1 });
      nav.register('b', () => {});
      return nav;
    });

    press('down');
    expect(result.current.focused).toBe('b');
  });

  // The main menu at `lg`: two tiles above four, each tile's place in its row being its column
  function setupRows() {
    const tiles = { sing: [0, 0], online: [1, 0], mics: [0, 1], songs: [1, 1], history: [2, 1], settings: [3, 1] };
    return renderHook(() => {
      const nav = useKeyboardNav({ direction: 'horizontal-vertical' });
      Object.entries(tiles).forEach(([name, [column, row]]) =>
        nav.register(name, () => {}, name, false, { column, row }),
      );
      return nav;
    });
  }

  it('goes round the row with Left/Right, skipping columns with nothing in it', () => {
    const { result } = setupRows();

    press('right');
    expect(result.current.focused).toBe('online');
    press('right');
    expect(result.current.focused).toBe('sing');
    press('left');
    expect(result.current.focused).toBe('online');
  });

  it('keeps to the row over where the selection last was in a column', () => {
    const { result } = setupRows();

    press('right');
    press('left');
    press('down');
    expect(result.current.focused).toBe('mics');
    press('right');
    expect(result.current.focused).toBe('songs');
  });

  it('lands on the nearest row when the next column has nothing in this one', () => {
    const { result } = renderHook(() => {
      const nav = useKeyboardNav({ direction: 'horizontal-vertical' });
      nav.register('top', () => {}, undefined, false, { column: 0, row: 0 });
      nav.register('middle', () => {}, undefined, false, { column: 0, row: 1 });
      nav.register('bottom', () => {}, undefined, false, { column: 0, row: 2 });
      nav.register('side-top', () => {}, undefined, false, { column: 1, row: 0 });
      nav.register('side-bottom', () => {}, undefined, false, { column: 1, row: 3 });
      return nav;
    });

    act(() => result.current.focusElement('bottom'));
    press('right');
    expect(result.current.focused).toBe('side-bottom');
  });
});
