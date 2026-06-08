import { Icon } from '@iconify-icon/react';
import { Button, IconButton } from '@mui/material';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import routePaths from '~/routes/route-paths';
import { LogoutButton } from './logout-button';

interface AdminModule<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  activeModule: T;
  modules: AdminModule<T>[];
  onLogout: () => void;
  onSelectModule: (moduleId: T) => void;
}

export function TopBar<T extends string>({ activeModule, modules, onLogout, onSelectModule }: Props<T>) {
  const navigate = useSmoothNavigate();

  return (
    <header className="flex flex-col gap-3 px-2 py-3 md:flex-row md:items-center md:justify-between md:px-4">
      <div className="flex items-center gap-2">
        <IconButton type="button" color="inherit" onClick={() => navigate(`${routePaths.MENU}/`)}>
          <Icon icon="mdi:arrow-left" />
        </IconButton>
        <span className="text-xl">Admin</span>
      </div>
      <nav className="flex flex-wrap items-center gap-2" aria-label="Admin modules">
        {modules.map((module) => (
          <Button
            key={module.id}
            type="button"
            aria-current={module.id === activeModule ? 'page' : undefined}
            variant={module.id === activeModule ? 'contained' : 'outlined'}
            color="inherit"
            onClick={() => onSelectModule(module.id)}>
            {module.label}
          </Button>
        ))}
        <LogoutButton onLogout={onLogout} />
      </nav>
    </header>
  );
}
