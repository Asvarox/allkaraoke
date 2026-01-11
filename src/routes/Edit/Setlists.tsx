import styled from '@emotion/styled';
import { LockOpen, LockOutlined } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import createPersistedState from 'use-persisted-state';
import { Link } from 'wouter';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import NoPrerender from '~/modules/Elements/NoPrerender';
import NormalizeFontSize from '~/modules/Elements/NormalizeFontSize';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import { encodeSongList } from '~/modules/Songs/utils/setlists';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import SongsTable from '~/routes/Edit/Components/SongsTable';

const MAX_SONGS_PER_SETLIST = 300;

interface StoredSetlistEntity {
  name: string;
  songList: number[];
  isEditable: boolean;
}

const useSetlists = createPersistedState<StoredSetlistEntity[]>('setlists');

export default function Setlists() {
  useBackground(false);
  useBackgroundMusic(false);
  const { data } = useSongIndex(true);
  const [setlists, setSetlists] = useSetlists([]);
  const [selectedSetlist, setSelectedSetlist] = useState<string | null>(null);

  const selectedSongs = setlists.find((setlist) => setlist.name === selectedSetlist)?.songList || [];
  const onSelect = (selected: number[]) => {
    if (selected.length > MAX_SONGS_PER_SETLIST) {
      alert(`You can only select up to ${MAX_SONGS_PER_SETLIST} songs per setlist.`);
      return;
    }
    setSetlists((prevSetlists) =>
      prevSetlists.map((setlist) => (setlist.name === selectedSetlist ? { ...setlist, songList: selected } : setlist)),
    );
  };

  if (!data) return <>Loading</>;

  return (
    <>
      <Helmet>
        <title>Song List | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <NoPrerender>
        <Container>
          <NormalizeFontSize />
          <Grid container rowGap={2}>
            <Grid item xs={3} display={'flex'} alignItems={'center'} justifyContent={'flex-start'}>
              <Link to="menu/">
                <Button data-test="main-menu-link">Return to main menu</Button>
              </Link>
            </Grid>
            <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
              <h4>Manage setlists</h4>
            </Grid>
            <Grid item xs={12}>
              <div className="flex flex-col items-stretch gap-4">
                <p className="leading-6">
                  This feature allows you to create a custom game link that includes only a selected subset of songs.
                  It&#39;s useful for contests or situations where you want to limit which songs are visible. Note that{' '}
                  <strong>locally added songs cannot be included</strong>. Additionally, if you add or remove a song,{' '}
                  <strong>the setlist link will change</strong> — so it&#39;s recommended to use a{' '}
                  <a href="https://tinyurl.com/" target="_blank" rel="noreferrer">
                    URL shortener
                  </a>{' '}
                  to generate a consistent short link and update it whenever you modify the setlist. Each setlist can
                  contain up to {MAX_SONGS_PER_SETLIST} songs.
                </p>
                <p>
                  You can also make a setlist non-editable, which prevents users from adding additional songs to it.
                </p>
                <h5 className="flex items-center gap-2">
                  Your setlists
                  <Button
                    data-test={'create-new-setlist'}
                    onClick={() => {
                      const name = prompt('Enter setlist name');
                      if (name) {
                        setSetlists((prevSetlists) => [...prevSetlists, { name, songList: [], isEditable: true }]);
                      }
                    }}>
                    Create new
                  </Button>
                </h5>
                {setlists.map((setlist) => {
                  const isSelected = setlist.name === selectedSetlist;
                  return (
                    <div
                      className={`flex ${isSelected ? 'bg-blue-100' : ''} items-center gap-4`}
                      key={setlist.name}
                      data-test={`setlist-${setlist.name}`}>
                      <span className="pl-2">
                        {setlist.isEditable ? <LockOpen /> : <LockOutlined />}&nbsp;
                        <strong>{setlist.name}</strong> ({setlist.songList?.length} songs)
                      </span>
                      <Button
                        data-test={'edit-setlist'}
                        variant={isSelected ? 'contained' : 'outlined'}
                        className="ml-auto!"
                        onClick={() => {
                          setSelectedSetlist(isSelected ? null : setlist.name);
                        }}>
                        Edit
                      </Button>
                      <Button
                        data-test={setlist.isEditable ? 'make-setlist-not-editable' : 'make-setlist-editable'}
                        onClick={() =>
                          setSetlists(
                            setlists.map((s) => (s.name === setlist.name ? { ...s, isEditable: !s.isEditable } : s)),
                          )
                        }>
                        {setlist.isEditable ? 'Make not editable' : 'Make editable'}
                      </Button>
                      <Button
                        color="error"
                        data-test={'remove-setlist'}
                        onClick={() => {
                          const confirmed = confirm(`Are you sure you want to delete the setlist "${setlist.name}"?`);
                          if (confirmed) {
                            setSetlists((prevSetlists) => prevSetlists.filter((s) => s.name !== setlist.name));
                            if (selectedSetlist === setlist.name) {
                              setSelectedSetlist(null);
                            }
                          }
                        }}>
                        Remove
                      </Button>
                      <Button
                        color="secondary"
                        variant="contained"
                        data-test={'copy-setlist-link'}
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.pathname = '';
                          url.searchParams.set('setlist', encodeSongList(setlist.songList, setlist.isEditable));
                          navigator.clipboard.writeText(url.toString());
                        }}>
                        Copy link
                      </Button>
                    </div>
                  );
                })}
                {setlists.length === 0 && <h6>No setlists created yet</h6>}
              </div>
            </Grid>
            <Grid item xs={12}>
              {selectedSetlist && (
                <SongsTable onSelect={onSelect} selectedSongs={selectedSongs} selectable data={data} />
              )}
            </Grid>
          </Grid>
        </Container>
      </NoPrerender>
    </>
  );
}

const Container = styled.div`
  margin: 0 auto;
  height: 100%;
  width: 1260px;
  background: white;
  padding: 60px 20px 0 20px;
`;
