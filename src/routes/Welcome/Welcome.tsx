import styled from '@emotion/styled';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import SmoothLink from 'modules/Elements/SmoothLink';
import { typography } from 'modules/Elements/cssMixins';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';
import FacebookLink from 'routes/Welcome/FacebookLink';

function Welcome() {
  useBackground(true);

  const navigate = useSmoothNavigate();

  useBackgroundMusic(/* true */ false);
  const { register } = useKeyboardNav();
  return (
    <MenuWithLogo>
      <Helmet>
        <title>Main Menu | AllKaraoke.Party - Free Online Karaoke Party Game</title>
        <link rel="preload" href="/songs/index.json" as="fetch" type="application/json" crossOrigin="anonymous" />
        <link rel="preload" href="/mostPopularSongs.json" as="fetch" type="application/json" crossOrigin="anonymous" />
      </Helmet>
      <BackgroundMusicCredit>
        <span>
          Bpm data and release year provided by{' '}
          <a target="_blank" href="https://getsongbpm.com/" rel="noreferrer">
            GetSongBPM
          </a>
        </span>
        <span>Song: Funk Cool Groove (Music Today 80)</span>
        <span>• Composed & Produced by : Anwar Amr</span>
        <span>
          • Video Link:{' '}
          <a href="https://youtu.be/FGzzBbYRjFY" target="_blank" rel="noreferrer">
            https://youtu.be/FGzzBbYRjFY
          </a>
        </span>
      </BackgroundMusicCredit>
      <FacebookLink />
      <>
        <SmoothLink to="game/">
          <Menu.Button {...register('sing-a-song', () => navigate('game/'))}>Sing a song</Menu.Button>
        </SmoothLink>
        <SmoothLink to="select-input/">
          <Menu.Button {...register('select-input', () => navigate('select-input/'))}>Setup Microphones</Menu.Button>
        </SmoothLink>
        <SmoothLink to="settings/">
          <Menu.Button {...register('settings', () => navigate('settings/'))}>Settings</Menu.Button>
        </SmoothLink>
        <SmoothLink to="jukebox/">
          <Menu.Button {...register('jukebox', () => navigate('jukebox/'))}>Jukebox</Menu.Button>
        </SmoothLink>
        <SmoothLink to="manage-songs/">
          <Menu.Button {...register('manage-songs', () => navigate('manage-songs/'))}>Manage Songs</Menu.Button>
        </SmoothLink>
      </>
    </MenuWithLogo>
  );
}

const BackgroundMusicCredit = styled.div`
  ${typography};
  text-decoration: none;
  flex-direction: column;
  display: flex;
  font-size: 1.5rem;
  gap: 1.25rem;
  opacity: 0.85;
  position: absolute;
  bottom: 4rem;
  left: 1rem;

  view-transition-name: background-music-credit;
`;

export default Welcome;
