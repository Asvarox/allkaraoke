import { Search } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { ComponentProps } from 'react';
import { twc } from 'react-twc';

export const Pre = twc.span`font-mono`;

// eslint-disable-next-line react-refresh/only-export-components
export const inputAction = (action: ComponentProps<typeof Button>['onClick'], enabled: boolean, label = 'Lookup') => ({
  InputProps: {
    endAdornment: (
      <Tooltip title={enabled ? 'Open search results for the song' : 'Artist or title of the song is unknown'}>
        <span>
          <Button
            sx={{ mr: -1 }}
            endIcon={<Search />}
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
});
