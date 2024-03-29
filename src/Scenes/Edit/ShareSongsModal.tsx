import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { captureException } from '@sentry/react';
import SongDao from 'Songs/SongsService';
import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import posthog from 'posthog-js';
import { useState } from 'react';
import createPersistedState from 'use-persisted-state';
import storage from 'utils/storage';

interface Props {
  id?: string | null;
}

const SHARE_SONGS_KEY = 'share-songs';
export const useShareSongs = createPersistedState<boolean | null>(SHARE_SONGS_KEY);

export const shareSong = async (id: string) => {
  try {
    const isShareEnabled = storage.getValue(SHARE_SONGS_KEY);

    if (!isShareEnabled) return;

    const songData = await SongDao.get(id);
    if (songData) {
      posthog.capture('share-song', { song: convertSongToTxt(songData) });
    }
  } catch (e) {
    console.error(e);
    captureException(e);
  }
};

export default function ShareSongsModal(props: Props) {
  const [shareSongs, setShareSongs] = useShareSongs(null);
  const [open, setOpen] = useState(!!props.id && shareSongs === null);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = (agreed: boolean) => {
    setShareSongs(agreed);
    if (agreed && props.id) {
      shareSong(props.id);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>Share songs</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Can you share songs you add? This would help tremendously as I will be able to add it for everyone to play 🥺
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAgree(false)} data-test="share-songs-disagree">
          Disagree
        </Button>
        <Button onClick={() => handleAgree(true)} autoFocus variant="contained" data-test="share-songs-agree">
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
}
