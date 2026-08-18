import { Helmet } from 'react-helmet';
import { twc } from 'react-twc';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { NavButton } from '~/modules/elements/nav-controls';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import LeaderboardPanel from '~/routes/welcome/leaderboard-panel';

function Welcome() {
  useBackground(true);

  const navigate = useSmoothNavigate();
  const onlineModeEnabled = useFeatureFlag(FeatureFlags.OnlineMode);

  useBackgroundMusic(/* true */ false);
  const { register } = useKeyboardNav({ title: 'Main Menu' });
  return (
    <>
      <MenuWithLogo sidePanel={<LeaderboardPanel />}>
        <Helmet>
          <title>Main Menu | AllKaraoke.Party - Free Online Karaoke Party Game</title>
          <link rel="preload" href="/songs/index.json" as="fetch" type="application/json" crossOrigin="anonymous" />
          <link
            rel="preload"
            href="/most-popular-songs.json"
            as="fetch"
            type="application/json"
            crossOrigin="anonymous"
          />
        </Helmet>
        {/* <FacebookLink /> */}
        <KeyboardNavContext value={register}>
          <NavButton name="sing-a-song" remoteIcon="play" onClick={() => navigate('game/')}>
            Sing a song
          </NavButton>
          {onlineModeEnabled && (
            <NavButton name="online" remoteIcon="play" onClick={() => navigate('online/')}>
              Sing Online
            </NavButton>
          )}
          <NavButton name="select-input" onClick={() => navigate('select-input/')}>
            Setup Microphones
          </NavButton>
          <NavButton name="settings" remoteIcon="settings" onClick={() => navigate('settings/')}>
            Settings
          </NavButton>
          <NavButton name="jukebox" onClick={() => navigate('jukebox/')}>
            Jukebox
          </NavButton>
          <NavButton name="history" onClick={() => navigate('history/')}>
            History
          </NavButton>
          <NavButton name="manage-songs" onClick={() => navigate('manage-songs/')}>
            Manage Songs
          </NavButton>
        </KeyboardNavContext>
        {/* Narrow screens have no second column, so the board sits here — below the menu, above the
            footer. The desktop copy is passed to `MenuWithLogo` as `sidePanel`; SWR dedupes the fetch. */}
        <LeaderboardPanel className="mt-2 lg:hidden" />
        <Menu.HelpText className="flex justify-between">
          Get in touch{' '}
          <span className="flex gap-3">
            <a href="https://www.facebook.com/allkaraoke.party" target="_blank" rel="noreferrer">
              <Icon icon="cib:facebook" width="0.8em" height="0.8em" /> Facebook
            </a>
            •
            <a href="https://www.instagram.com/allkaraoke.party" target="_blank" rel="noreferrer">
              <Icon icon="cib:instagram" width="0.8em" height="0.8em" /> Instagram
            </a>
            •
            <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
              <Icon icon="cib:github" width="0.8em" height="0.8em" /> Github
            </a>
          </span>
        </Menu.HelpText>
      </MenuWithLogo>
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
    </>
  );
}

const BackgroundMusicCredit = twc.div`typography flex flex-col text-sm no-underline opacity-85 [view-transition-name:background-music-credit]`;

export default Welcome;
