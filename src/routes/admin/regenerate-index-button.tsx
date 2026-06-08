import Sync from '@mui/icons-material/Sync';
import { Button } from '@mui/material';

interface Props {
  disabled?: boolean;
  onRegenerate: () => void;
}

export function RegenerateIndexButton({ disabled, onRegenerate }: Props) {
  return (
    <Button startIcon={<Sync />} variant="outlined" onClick={onRegenerate} disabled={disabled}>
      Reindex
    </Button>
  );
}
