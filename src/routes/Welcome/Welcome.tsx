import styled from '@emotion/styled';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import { MenuButton } from 'modules/Elements/Menu';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import SmoothLink from 'modules/Elements/SmoothLink';
import { typography } from 'modules/Elements/cssMixins';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';
import { BackgroundMusicSetting, useSettingValue } from 'routes/Settings/SettingsState';
import FacebookLink from 'routes/Welcome/FacebookLink';

function Welcome() {
  const [backgroundMusicSelection] = useSettingValue(BackgroundMusicSetting);
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
      {backgroundMusicSelection !== 'Classic' && (
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
      )}
      <FacebookLink />
      <>
        <SmoothLink to="game/">
          <MenuButton {...register('sing-a-song', () => navigate('game/'))}>Sing a song</MenuButton>
        </SmoothLink>
        <SmoothLink to="select-input/">
          <MenuButton {...register('select-input', () => navigate('select-input/'))}>Setup Microphones</MenuButton>
        </SmoothLink>
        <SmoothLink to="settings/">
          <MenuButton {...register('settings', () => navigate('settings/'))}>Settings</MenuButton>
        </SmoothLink>
        <SmoothLink to="jukebox/">
          <MenuButton {...register('jukebox', () => navigate('jukebox/'))}>Jukebox</MenuButton>
        </SmoothLink>
        <SmoothLink to="manage-songs/">
          <MenuButton {...register('manage-songs', () => navigate('manage-songs/'))}>Manage Songs</MenuButton>
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
