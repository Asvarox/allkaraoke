import { Button, TextField } from '@mui/material';
import { FormEvent } from 'react';

interface Props {
  password: string;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginScreen({ password, onPasswordChange, onSubmit }: Props) {
  return (
    <form className="mx-auto flex w-full max-w-md flex-col gap-4" onSubmit={onSubmit}>
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
        onChange={(event) => onPasswordChange(event.target.value)}
        required
        fullWidth
        size="small"
      />
      <Button type="submit" variant="contained">
        Sign in
      </Button>
    </form>
  );
}
