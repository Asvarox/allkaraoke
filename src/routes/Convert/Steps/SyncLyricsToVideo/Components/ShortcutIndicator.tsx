import { Tooltip, useMediaQuery } from '@mui/material';
import React from 'react';

interface Props {
  shortcutKey: string;
  children: React.ReactElement<unknown, any>;
}

export default function ShortcutIndicator({ shortcutKey, children }: Props) {
  const hidden = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  if (hidden) {
    return children;
  }
  return (
    <Tooltip
      title={`${shortcutKey}`}
      placement={'bottom-end'}
      open
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [5, -20],
              },
            },
          ],
        },
      }}>
      {children}
    </Tooltip>
  );
}
