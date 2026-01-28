import { Tooltip, useMediaQuery } from '@mui/material';
import React from 'react';
import isE2E from '~/modules/utils/isE2E';

interface Props {
  shortcutKey: string;
  children: React.ComponentProps<typeof Tooltip>['children'];
}

export default function ShortcutIndicator({ shortcutKey, children }: Props) {
  const hidden = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  if (hidden || isE2E()) {
    return children;
  }
  return (
    <Tooltip
      disableInteractive
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
