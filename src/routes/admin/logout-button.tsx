import Logout from '@mui/icons-material/Logout';
import { Button } from '@mui/material';

interface Props {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: Props) {
  return (
    <Button type="button" variant="outlined" startIcon={<Logout />} onClick={onLogout}>
      Logout
    </Button>
  );
}
