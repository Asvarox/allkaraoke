import { Button, IconButton, Tooltip } from '@mui/material';
import { ComponentProps, ReactNode } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { usePhoneOrientation } from '~/modules/hooks/use-breakpoint';
import { twx } from '~/utils/twx';

export const Pre = twx.span`font-mono`;

type ActionHandler = ComponentProps<typeof Button>['onClick'];

function InputActionButton({ action, enabled, label }: { action: ActionHandler; enabled: boolean; label: string }) {
  const isPhone = usePhoneOrientation() !== null;

  return (
    <Tooltip title={enabled ? 'Open search results for the song' : 'Artist or title of the song is unknown'}>
      <span>
        {isPhone ? (
          <IconButton
            data-test="input-lookup"
            aria-label={label}
            color="secondary"
            onClick={action}
            disabled={!enabled}
            edge="end">
            <Icon icon="ic:baseline-search" />
          </IconButton>
        ) : (
          <Button
            data-test="input-lookup"
            sx={{ mr: -1 }}
            endIcon={<Icon icon="ic:baseline-search" />}
            color={'secondary'}
            variant={'text'}
            onClick={action}
            disabled={!enabled}>
            {label}
          </Button>
        )}
      </span>
    </Tooltip>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const inputAction = (action: ActionHandler, enabled: boolean, label = 'Lookup', extra?: ReactNode) => ({
  slotProps: {
    input: {
      endAdornment: (
        <>
          {extra}
          <InputActionButton action={action} enabled={enabled} label={label} />
        </>
      ),
    },
  },
});
