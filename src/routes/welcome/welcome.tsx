import { Helmet } from 'react-helmet';

import { Badge } from '~/modules/elements/akui/badge';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useJukeboxHidden from '~/modules/hooks/use-jukebox-hidden';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import LayoutGame from '~/routes/layout-game';
import LeaderboardPanel from '~/routes/welcome/leaderboard-panel';
import MenuFooter from '~/routes/welcome/menu-footer';
import MenuTile from '~/routes/welcome/menu-tile';

/**
 * The main menu, laid out as tiles rather than the stacked button list every other screen uses: the
 * two ways into a game get a row of their own at the top, the five supporting screens share a
 * shorter row underneath, and the leaderboard takes a full-height rail on the right. Below `lg` the
 * rail has nowhere to go, so the whole thing folds into one column with the board under the tiles.
 */
function Welcome() {
  useBackground(true);

  const navigate = useSmoothNavigate();
  const onlineModeEnabled = useFeatureFlag(FeatureFlags.OnlineMode);
  // Asked here as well as inside the panel: with the board off there is no rail, and the tiles should
  // take the width back rather than sit next to an empty column.
  const leaderboardEnabled = useLeaderboardEnabled();
  // Experiment: hiding the Jukebox entry point to see whether it changes how many songs people sing.
  const jukeboxHidden = useJukeboxHidden();

  useBackgroundMusic(/* true */ false);
  // Tiles sit in a grid, so all four arrows navigate by position — see `handleSpatialNavigation`.
  // `inline` moves the key list into the footer, out of the corner the leaderboard rail now occupies.
  const { register } = useKeyboardNav({
    title: 'Main Menu',
    direction: 'horizontal-vertical',
    additionalHelp: { placement: 'inline' },
  });

  return (
    <LayoutGame>
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
      {/* `h-dvh` only from `lg`: on a TV the menu is meant to fill the screen exactly, with the tile
          rows sharing the leftover height. Narrower than that it grows past the fold and scrolls,
          which is the only way five tiles, the board and the footer all fit on a phone. */}
      <div className="mobile:gap-3 mobile:p-3 flex min-h-dvh w-screen flex-col gap-4 p-4 lg:h-dvh lg:gap-6 lg:p-6">
        {/* The utility icons the design puts next to the logo are the app-wide `Toolbar`, which is
            already fixed to this corner (see `layout-game.tsx`) — hence the reserved space on the right. */}
        <header className="flex shrink-0 items-center justify-between gap-6 pr-32">
          <div className="mobile:text-3xl text-4xl">
            <Logo />
          </div>
        </header>

        <div
          className={`grid min-h-0 flex-1 gap-4 lg:gap-6 ${
            leaderboardEnabled ? 'lg:grid-cols-[minmax(0,1fr)_26rem]' : ''
          }`}>
          <div className="mobile:gap-3 flex min-h-0 flex-col gap-4 lg:gap-6">
            <KeyboardNavContext value={register}>
              {/* `auto-cols-fr` with column flow rather than a fixed column count: the top row is one
                  tile or two depending on the online-mode flag, and the bottom row is however many
                  supporting screens exist — neither should have to restate a column count. */}
              <div className="mobile:gap-3 grid flex-1 grid-cols-1 gap-4 lg:auto-cols-fr lg:grid-flow-col lg:gap-6">
                <MenuTile
                  name="sing-a-song"
                  variant="primary"
                  label="Sing a song"
                  hint="Start your performance"
                  remoteIcon="play"
                  onClick={() => navigate('game/')}
                />
                {onlineModeEnabled && (
                  <MenuTile
                    name="online"
                    variant="primary"
                    label="Sing Online"
                    hint="Play with friends remotely"
                    remoteIcon="play"
                    badge={<Badge>Preview</Badge>}
                    onClick={() => navigate('online/')}
                  />
                )}
              </div>
              <div className="mobile:gap-3 grid flex-1 grid-cols-2 gap-4 lg:auto-cols-fr lg:grid-flow-col lg:gap-6">
                {!jukeboxHidden && (
                  <MenuTile name="jukebox" label="Jukebox" hint="Browse & queue" onClick={() => navigate('jukebox/')} />
                )}
                <MenuTile
                  name="select-input"
                  label="Setup Microphones"
                  hint="Configure audio"
                  onClick={() => navigate('select-input/')}
                />
                <MenuTile
                  name="manage-songs"
                  label="Manage Songs"
                  hint="Edit collection"
                  onClick={() => navigate('manage-songs/')}
                />
                <MenuTile name="history" label="History" hint="Past scores" onClick={() => navigate('history/')} />
                <MenuTile
                  name="settings"
                  label="Settings"
                  hint="Sound, language"
                  remoteIcon="settings"
                  onClick={() => navigate('settings/')}
                />
              </div>
            </KeyboardNavContext>
          </div>
          {/* One instance, not a desktop/narrow pair: it moves from the rail to the bottom of the
              single column purely by where the grid puts it. */}
          {leaderboardEnabled && <LeaderboardPanel className="lg:h-full" />}
        </div>

        <MenuFooter />
      </div>
    </LayoutGame>
  );
}

export default Welcome;
