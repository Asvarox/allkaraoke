import { Button } from '@mui/material';

import { Icon } from '~/modules/elements/akui/icon';

interface Props {
  disabled?: boolean;
  onRegenerate: () => void;
}

export function RegenerateIndexButton({ disabled, onRegenerate }: Props) {
  return (
    <Button startIcon={<Icon icon="ic:baseline-sync" />} variant="outlined" onClick={onRegenerate} disabled={disabled}>
      Reindex
    </Button>
  );
}
