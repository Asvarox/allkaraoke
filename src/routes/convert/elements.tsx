import { Button, Tooltip } from '@mui/material';
import { ComponentProps } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { twx } from '~/utils/twx';

export const Pre = twx.span`font-mono`;

// eslint-disable-next-line react-refresh/only-export-components
export const inputAction = (action: ComponentProps<typeof Button>['onClick'], enabled: boolean, label = 'Lookup') => ({
  slotProps: {
    input: {
      endAdornment: (
        <Tooltip title={enabled ? 'Open search results for the song' : 'Artist or title of the song is unknown'}>
          <span>
            <Button
              sx={{ mr: -1 }}
              endIcon={<Icon icon="ic:baseline-search" />}
              color={'secondary'}
              variant={'text'}
              onClick={action}
              disabled={!enabled}>
              {label}
            </Button>
          </span>
        </Tooltip>
      ),
    },
  },
});
