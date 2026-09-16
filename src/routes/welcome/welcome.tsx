import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet';

import { Chip } from '~/modules/elements/akui/chip';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import ExcludeLanguagesView from '~/routes/exclude-languages/exclude-languages-view';
import LayoutGame from '~/routes/layout-game';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/settings/settings-state';
import LeaderboardPanel from '~/routes/welcome/leaderboard-panel';
import MenuFooter from '~/routes/welcome/menu-footer';
import MenuTile from '~/routes/welcome/menu-tile';
import { MenuViewTransition } from '~/routes/welcome/menu-view-transitions';

/**
 * The main menu as tiles rather than the stacked button list every other screen uses: the two ways
 * into a game get a row of their own at the top, the supporting screens share a shorter row
 * underneath, and the leaderboard takes a full-height rail on the right. Below `lg` the rail has
 * nowhere to go, so the whole thing folds into one column with the board under the tiles.
 */
function Welcome() {
  useBackground(true);

  const navigate = useSmoothNavigate();

  // The first-run language pick belongs to "sing a song", so it happens here, as a modal over the
  // menu, instead of the song list swapping itself out for a full screen once the route has changed.
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const [languageSelection, setLanguageSelection] = useState(false);
  const goToSongList = () => {
    if (excludedLanguages === null) {
      setLanguageSelection(true);
    } else {
      navigate('game/');
    }
  };
  // Mic setup is a menu entry, not a place: it opens over the tiles the same way the language pick
  // does, so finishing it puts the user back where they started instead of on a screen they have to
  // navigate out of. `settings/` still links to the standalone route.
  const [micSetup, setMicSetup] = useState(false);

  // Backing out puts the setting back to "never asked": the dialog fills it in from `navigator.
  // languages` as soon as it opens, and leaving that behind would mean a user who cancelled is
  // never asked again — they would go straight to a song list filtered by a guess they never saw.
  const cancelLanguages = () => {
    setExcludedLanguages(null);
    setLanguageSelection(false);
  };

  const confirmLanguages = () => {
    setExcludedLanguages(excludedLanguages ?? []);
    setLanguageSelection(false);
    // No view transition on the way out: the tiles it would morph have been behind a dialog the
    // whole time, so it animates nothing the user can see — and until it finishes, the song list
    // underneath is a snapshot that swallows the first click.
    navigate('game/', undefined, { smooth: false });
  };

  useBackgroundMusic(/* true */ false);
  // Tiles sit in a grid, so all four arrows navigate by position — see `handleSpatialNavigation`.
  const { register } = useKeyboardNav({
    // An open dialog owns the keyboard — the tiles behind it must not answer the arrows as well.
    enabled: !languageSelection && !micSetup,
    title: 'Main Menu',
    direction: 'horizontal-vertical',
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
      {/* `h-dvh` only from `xl`, the width the board takes a column of its own: on a TV the menu is
          meant to fill the screen exactly, with the tile rows sharing the leftover height. Narrower
          than that the board is stacked under the tiles, and tiles plus board plus footer only fit by
          growing past the fold and scrolling. */}
      <div className="flex min-h-dvh w-screen flex-col gap-4 p-4 max-lg:gap-3 max-lg:p-3 xl:h-dvh xl:gap-6 xl:p-6">
        {/* The utility icons the design puts next to the logo are the app-wide `Toolbar`, which is
            already fixed to this corner (see `layout-game.tsx`) — hence the reserved space on the right. */}
        <header className="flex shrink-0 items-center justify-between gap-6 pr-32">
          {/* The logo is sized in `em`, so this is its whole scale. Capped at the size the design
              asks for and kept proportional to the viewport below that, or it runs off a phone. */}
          <div className="text-[min(13vw,5.25rem)]">
            <Logo />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_32rem]">
          <div className="flex min-h-0 flex-col gap-4 max-lg:gap-3 lg:gap-6">
            <KeyboardNavContext value={register}>
              {/* `auto-cols-fr` with column flow rather than a fixed column count: the top row is the
                  two ways into a game, and the bottom row is however many supporting screens exist —
                  neither should have to restate a column count. */}
              <div className="grid flex-1 grid-cols-1 gap-4 max-lg:gap-3 lg:auto-cols-fr lg:grid-flow-col lg:gap-6">
                {/* The view-transition names pair these tiles with the blocks the new landing page
                    puts in the same roles — see `menu-view-transitions.ts` for the whole mapping. */}
                <MenuTile
                  name="sing-a-song"
                  variant="primary"
                  label="Sing a song"
                  hint="Sing solo or start a party"
                  remoteIcon="play"
                  className={MenuViewTransition.SING_A_SONG}
                  onClick={goToSongList}
                />
                <MenuTile
                  name="online"
                  variant="primary"
                  label="Sing online"
                  displayLabel={
                    <div className="flex items-center gap-2">
                      <Chip variant="orange">Preview</Chip> Sing online
                    </div>
                  }
                  hint="Play with friends remotely"
                  remoteIcon="play"
                  className={MenuViewTransition.SING_ONLINE}
                  onClick={() => navigate('online/')}
                />
              </div>
              <div className="grid flex-1 grid-cols-1 gap-4 max-lg:gap-3 lg:auto-cols-fr lg:grid-flow-col lg:gap-6">
                <MenuTile
                  name="select-input"
                  label="Setup Microphones"
                  hint="Configure audio"
                  className={MenuViewTransition.TILES[0]}
                  onClick={() => setMicSetup(true)}
                />
                <MenuTile
                  name="manage-songs"
                  label="Manage Songs"
                  hint="Select languages, add new songs"
                  className={MenuViewTransition.TILES[1]}
                  onClick={() => navigate('manage-songs/')}
                />
                <MenuTile
                  name="history"
                  label="History"
                  hint="Past scores"
                  className={MenuViewTransition.TILES[2]}
                  onClick={() => navigate('history/')}
                />
                <MenuTile
                  name="settings"
                  label="Settings"
                  hint="Graphics, additional options"
                  remoteIcon="settings"
                  className={MenuViewTransition.TILES[3]}
                  onClick={() => navigate('settings/')}
                />
              </div>
            </KeyboardNavContext>
          </div>
          {/* One instance, not a desktop/narrow pair: it moves from the rail to the bottom of the
              single column purely by where the grid puts it.

              As a rail (from `xl`) it fills its cell absolutely rather than sitting in it: fifty rows
              are taller than the tiles beside them, and in flow that height becomes the row's — the
              screen this one is pinned to the viewport for then scrolls anyway, to show a list that
              can scroll itself. Out of flow it has no height to give, so the rail is as tall as the
              tiles and the list takes what is left. Below `xl` it is a block under them, where its
              own five-row height is what it should be. */}
          <div className="relative">
            <LeaderboardPanel
              className={`${MenuViewTransition.LEADERBOARD} xl:absolute xl:inset-0`}
              listClassName="xl:h-auto xl:min-h-0 xl:flex-1"
            />
          </div>
        </div>

        <MenuFooter />
      </div>
      {/* Portalled to the body, as the song settings screen does with the same dialog: inside the
          menu's own layout the tiles paint over its backdrop and keep taking the clicks. */}
      {createPortal(
        <SelectInputModal open={micSetup} onClose={() => setMicSetup(false)} closeButtonText="Go to main menu" />,
        document.body,
      )}
      {languageSelection && (
        <ExcludeLanguagesView
          variant="modal"
          closeText="Continue to Song Selection"
          onClose={confirmLanguages}
          onCancel={cancelLanguages}
        />
      )}
    </LayoutGame>
  );
}

export default Welcome;
