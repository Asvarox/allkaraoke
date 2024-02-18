import styled from '@emotion/styled';
import { LinkButton } from 'Elements/Button';
import { useBackground } from 'Elements/LayoutWithBackground';
import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import SmoothLink from 'Elements/SmoothLink';
import { typography } from 'Elements/cssMixins';
import { BackgroundMusicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import FacebookLink from 'Scenes/Welcome/FacebookLink';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';

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
          <MenuButton as={LinkButton} {...register('sing-a-song', () => navigate('game/'))}>
            Sing a song
          </MenuButton>
        </SmoothLink>
        <SmoothLink to="select-input/">
          <MenuButton as={LinkButton} {...register('select-input', () => navigate('select-input/'))}>
            Setup Microphones
          </MenuButton>
        </SmoothLink>
        <SmoothLink to="settings/">
          <MenuButton as={LinkButton} {...register('settings', () => navigate('settings/'))}>
            Settings
          </MenuButton>
        </SmoothLink>
        <SmoothLink to="jukebox/">
          <MenuButton as={LinkButton} {...register('jukebox', () => navigate('jukebox/'))}>
            Jukebox
          </MenuButton>
        </SmoothLink>
        <SmoothLink to="manage-songs/">
          <MenuButton as={LinkButton} {...register('manage-songs', () => navigate('manage-songs/'))}>
            Manage Songs
          </MenuButton>
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
  font-size: 1rem;
  gap: 1.25rem;
  opacity: 0.85;
  position: absolute;
  bottom: 1rem;
  left: 1rem;

  view-transition-name: background-music-credit;
`;

export default Welcome;
