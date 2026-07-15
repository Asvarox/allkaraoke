import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useBackground } from '~/modules/elements/background-context';
import NoPrerender from '~/modules/elements/no-prerender';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';

import { clearAdminPassword, getAdminPassword, setAdminPassword } from './admin-password';
import { LoginScreen } from './login-screen';
import { TopBar } from './top-bar';
import { UnverifiedSongManagement } from './unverified-song-management';

type AdminModule = 'unverified-songs';

const modules: { id: AdminModule; label: string }[] = [{ id: 'unverified-songs', label: 'Unverified Songs' }];

export default function Admin() {
  useBackground(false);
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<AdminModule>('unverified-songs');

  useEffect(() => {
    const storedPassword = getAdminPassword();

    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (nextPassword: string, rememberPassword: boolean) => {
    setPassword(nextPassword);
    setAdminPassword(nextPassword, rememberPassword);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAdminPassword();
    setPassword('');
    setIsAuthenticated(false);
    setActiveModule('unverified-songs');
    navigate('admin/');
  };

  return (
    <>
      <Helmet>
        <title>Admin | AllKaraoke.Party</title>
      </Helmet>
      <NoPrerender>
        <main className="min-h-screen py-4 md:py-8">
          <div className="mx-auto min-h-screen max-w-[1260px]">
            {isAuthenticated && (
              <TopBar
                activeModule={activeModule}
                modules={modules}
                onLogout={handleLogout}
                onSelectModule={(moduleId) => setActiveModule(moduleId)}
              />
            )}
            <div className="flex flex-col gap-4 px-2 md:px-4">
              {!isAuthenticated ? (
                <LoginScreen onSubmit={handleLogin} />
              ) : (
                activeModule === 'unverified-songs' && <UnverifiedSongManagement password={password} />
              )}
            </div>
          </div>
        </main>
      </NoPrerender>
    </>
  );
}
