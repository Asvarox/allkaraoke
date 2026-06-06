import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import Refresh from '@mui/icons-material/Refresh';
import Sync from '@mui/icons-material/Sync';
import { Alert, Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';
import { FormEvent, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { useBackground } from '~/modules/elements/background-context';
import NoPrerender from '~/modules/elements/no-prerender';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { clearAdminPassword, getAdminPassword, setAdminPassword } from './admin-password';
import {
  AdminSharedSong,
  deleteAdminSharedSong,
  listAdminSharedSongs,
  regenerateAdminSharedSongsIndex,
} from './shared-songs-admin-api';

const columns: MRT_ColumnDef<AdminSharedSong>[] = [
  {
    accessorKey: 'artist',
    header: 'Artist',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorFn: (song) => song.language.join(', '),
    id: 'language',
    header: 'Language',
  },
  {
    accessorKey: 'videoId',
    header: 'Video',
  },
  {
    accessorKey: 'songId',
    header: 'Song ID',
  },
  {
    accessorKey: 'externalSongId',
    header: 'External ID',
  },
];

export default function Admin() {
  useBackground(false);
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const [password, setPassword] = useState('');
  const [songs, setSongs] = useState<AdminSharedSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadSongs = async (adminPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await listAdminSharedSongs(adminPassword);
      setSongs(list);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setError(error instanceof Error ? error.message : 'Failed to load shared songs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedPassword = getAdminPassword();

    if (storedPassword) {
      setPassword(storedPassword);
      void loadSongs(storedPassword);
    }
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminPassword(password);
    void loadSongs(password);
  };

  const handleDelete = async (externalSongId: string) => {
    if (!global.confirm('Remove this shared song from Cloudflare KV?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteAdminSharedSong(password, externalSongId);
      await loadSongs(password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete shared song');
      setIsLoading(false);
    }
  };

  const handleRegenerateIndex = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await regenerateAdminSharedSongsIndex(password);
      await loadSongs(password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to regenerate shared songs index');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminPassword();
    setPassword('');
    setSongs([]);
    setIsAuthenticated(false);
    setError(null);
    navigate('admin/');
  };

  return (
    <>
      <Helmet>
        <title>Shared Songs Admin | AllKaraoke.Party</title>
      </Helmet>
      <NoPrerender>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
                Shared Songs Admin
              </Typography>
              {isAuthenticated && (
                <>
                  <Button startIcon={<Sync />} variant="outlined" onClick={handleRegenerateIndex} disabled={isLoading}>
                    Reindex
                  </Button>
                  <Button
                    startIcon={<Refresh />}
                    variant="outlined"
                    onClick={() => void loadSongs(password)}
                    disabled={isLoading}>
                    Refresh
                  </Button>
                  <Button startIcon={<Logout />} variant="outlined" color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {!isAuthenticated ? (
              <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 420 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Admin password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button type="submit" variant="contained" disabled={isLoading}>
                    Sign in
                  </Button>
                </Stack>
              </Box>
            ) : (
              <MaterialReactTable
                columns={columns}
                data={songs}
                state={{ isLoading }}
                getRowId={(song) => song.externalSongId}
                enableRowActions
                positionActionsColumn="last"
                initialState={{
                  density: 'compact',
                  showGlobalFilter: true,
                }}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                renderRowActions={({ row }) => (
                  <Stack direction="row">
                    <Tooltip title="Edit shared song">
                      <Link
                        to={`edit/song/?externalSong=${encodeURIComponent(row.original.externalSongId)}&admin=true`}
                        aria-label={`Edit ${row.original.title}`}>
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Link>
                    </Tooltip>
                    <Tooltip title="Delete shared song">
                      <IconButton
                        size="small"
                        aria-label={`Delete ${row.original.title}`}
                        onClick={() => void handleDelete(row.original.externalSongId)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              />
            )}
          </Stack>
        </Box>
      </NoPrerender>
    </>
  );
}
