import styled from '@emotion/styled';
import { Search } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { ComponentProps } from 'react';

export const Pre = styled.span`
  font-family: monospace;
`;

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
