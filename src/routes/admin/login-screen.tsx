import { Button, FormControlLabel, Switch, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';

interface Props {
  onSubmit: (password: string, rememberPassword: boolean) => void;
}

export function LoginScreen({ onSubmit }: Props) {
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(password, rememberPassword);
  };

  return (
    <form className="mx-auto flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl">Admin</h1>
        <p className="text-sm">Sign in to manage operational modules.</p>
      </div>
      <TextField
        id="admin-password"
        label="Admin password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
        size="small"
      />
      <FormControlLabel
        control={
          <Switch
            checked={rememberPassword}
            onChange={(event) => setRememberPassword(event.target.checked)}
            data-test="remember-me-switch"
          />
        }
        label="Remember me"
      />
      <Button type="submit" variant="contained">
        Sign in
      </Button>
    </form>
  );
}
