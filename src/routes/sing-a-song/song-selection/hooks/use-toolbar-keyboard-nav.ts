import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';

interface Options {
  enabled: boolean;
  onExitDown: () => void;
  onExitBackspace: () => void;
}

export default function useToolbarKeyboardNav({ enabled, onExitDown, onExitBackspace }: Options) {
  const [activeRow, setActiveRow] = useState<1 | 2>(1);

  const row1Nav = useKeyboardNav({
    enabled: enabled && activeRow === 1,
    direction: 'horizontal',
    onBackspace: onExitBackspace,
  });

  const row2Nav = useKeyboardNav({
    enabled: enabled && activeRow === 2,
    direction: 'horizontal',
    onBackspace: onExitBackspace,
  });

  // Down from row 1 → row 2 (Song Groups nav)
  useHotkeys('down', () => setActiveRow(2), { enabled: enabled && activeRow === 1 }, [enabled, activeRow]);
  // Up from row 2 → row 1 (Search/Random/Playlists)
  useHotkeys('up', () => setActiveRow(1), { enabled: enabled && activeRow === 2 }, [enabled, activeRow]);
  // Down from row 2 → exit toolbar, enter song list
  useHotkeys('down', onExitDown, { enabled: enabled && activeRow === 2 }, [enabled, activeRow, onExitDown]);

  return {
    row1Register: row1Nav.register as RegisterFunc,
    row2Register: row2Nav.register as RegisterFunc,
    focusRow1Element: row1Nav.focusElement,
    focusRow2Element: row2Nav.focusElement,
    setActiveRow,
  };
}
