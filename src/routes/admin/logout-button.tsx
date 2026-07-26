import { Button } from '@mui/material';

import { Icon } from '~/modules/elements/akui/icon';

interface Props {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: Props) {
  return (
    <Button type="button" variant="outlined" startIcon={<Icon icon="ic:baseline-logout" />} onClick={onLogout}>
      Logout
    </Button>
  );
}
