import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';

import { ButtonLink } from '~/modules/elements/akui/button';
import { Chip } from '~/modules/elements/akui/chip';
import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import SmoothLink from '~/modules/elements/smooth-link';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import LeaderboardPanel from '~/routes/welcome/leaderboard-panel';
import MenuFooter from '~/routes/welcome/menu-footer';
import { MenuViewTransition } from '~/routes/welcome/menu-view-transitions';
import { twx } from '~/utils/twx';

import LogoIcon from './logo-icon';
import RecentlyAddedSongs from './recently-added-songs';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import songStats from './song-stats.json';

const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const songCount = formatter.format(songStats.songs);
const languageCount = songStats.languages.length;

// What the stat tiles under the card used to say, now that the songs themselves have taken that
// row: everything there that was a claim about the game rather than about the catalogue.
const bullets = [
  <>
    Use either your SingStar/regular microphone or <strong>connect phones to sing</strong>.
  </>,
  <>
    <strong>{songCount} songs</strong> across {languageCount} languages, updated weekly.
  </>,
  <>
    <strong>1–4 players</strong> — solo, duets or a full party.
  </>,
  <>
    Compete with friends and with players <strong>across the globe</strong>.
  </>,
  <>
    <strong>100% free</strong> and open source.
  </>,
];

/**
 * The landing page built from the main menu's own vocabulary — the same `Box` surfaces, the same
 * `LeaderboardPanel` rail, the same footer — so arriving at the menu reads as the next screen of one
 * app rather than a different product. The pitch keeps its place at the top; below it the entry
 * point, the online-mode teaser and the newest songs sit in cards, with the live global board alongside.
 *
 * The call to action swaps by viewport rather than by copy: on a desktop the visitor is the one
 * hosting, so "Enter the game" is the primary and joining is a text link under it; on a phone they
 * are almost always joining someone else's game, so "Join with code" takes the primary and entering
 * steps back — and leads to `quick-setup/`, which is what a phone needs before it can host.
 */
function LandingPage() {
  const navigate = useSmoothNavigate();

  useBackground(true);

  const nextPage = 'menu/';
  useHotkeys(
    'enter',
    () => {
      navigate(nextPage);
    },
    [nextPage],
  );

  return (
    <>
      <Helmet>
        <title>AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      {/* `min-h-dvh` and not `h-dvh`: unlike the menu, this screen has a paragraph and a card of
          copy in it, so pinning it to the viewport would squeeze those rather than the gaps. It
          fills the first screenful and grows past it when the text needs the room. */}
      <div className="flex min-h-dvh w-screen flex-col gap-3 p-3 lg:gap-4 lg:p-4 xl:gap-6 xl:p-6">
        {/* The same scale the tiled menu gives its logo — the logo carries a view-transition name of
            its own (see `logo.tsx`), so matching sizes is what makes it hold still on the way in. */}
        <header className="flex shrink-0 items-center gap-4 text-[min(13vw,5.25rem)]">
          <LogoIcon />
          <Logo />
        </header>

        {/* The rail is the menu's own column, to the rem: the board is the same panel on both
            screens and it morphs from one to the other, so a different width here would make it
            jump. */}
        <div className="grid flex-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_32rem]">
          <div className="flex flex-col gap-3 lg:gap-4 xl:gap-6">
            <Box
              className={`${MenuViewTransition.SING_A_SONG} flex-1 items-stretch justify-start gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6`}>
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <Menu.Header>Free karaoke party game</Menu.Header>
                <Typography className="text-md text-justify">
                  <strong>AllKaraoke</strong> is a free online karaoke game inspired by PlayStation`s{' '}
                  <strong>SingStar</strong>. Sing along to your favorite songs and compete with your friends, all
                  through the browser!
                </Typography>

                <ul className="text-md flex flex-col gap-1.5">
                  {/* Keyed by position: the list is a module-level constant that never reorders, and
                      the entries are elements rather than strings, so there is nothing else stable. */}
                  {bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-active mt-[0.5em] size-1.5 shrink-0 rounded-full" />
                      <Typography className="text-md *: leading-snug">{bullet}</Typography>
                    </li>
                  ))}
                </ul>
                {/* The shots, when they are not in a column of their own beside the text: side by
                    side under the copy and above the button. That is every width where the text
                    column would otherwise be squeezed — under `lg`, where the card is one column
                    anyway, and from `xl` to 1600px, where the leaderboard rail has taken 32rem out
                    of the row and the two halves are too narrow to read.
                    Written as two disjoint ranges rather than a show/hide chain: an arbitrary
                    `min-[…]` variant is not sorted in with the named breakpoints, so `xl:` wins over
                    `min-[1600px]:` however the two are ordered. */}
                <div className="hidden justify-center gap-3 max-lg:flex xl:max-[1599px]:flex">
                  <Screenshot src={screenshot1} alt="Song list screen" className="min-w-0 flex-1" />
                  <Screenshot src={screenshot2} alt="In-game screen" className="min-w-0 flex-1" />
                </div>

                {/* Pushes the call to action to the bottom of the card, however tall the grid makes it */}
                <div className="hidden flex-1 lg:block" />

                <div className="mt-5 hidden flex-col gap-2 lg:flex">
                  <SmoothLink to={nextPage} asChild>
                    <PrimaryCta size="regular" data-test="enter-the-game">
                      Enter the game
                    </PrimaryCta>
                  </SmoothLink>
                  <Typography className="text-md text-center">
                    Have a game code?{' '}
                    <SmoothLink to="remote-mic/" asChild>
                      <a data-test="join-existing-game">Join instead</a>
                    </SmoothLink>
                  </Typography>
                </div>
              </div>

              {/* Both shots at four fifths of the column and their own 16:9 height, so neither is
                  cropped. The fifth they give up is the point: the first hangs off the right edge and
                  the second off the left, which reads as two screens of one app rather than a stack
                  of thumbnails. Out of flow because in it, two images at their natural ratio are
                  taller than the text beside them and it is the card that ends up sized by the
                  pictures — centred and clipped instead, for a card too short to hold them. */}
              <div className="relative hidden min-w-0 flex-1 min-[1600px]:block lg:max-xl:block">
                <div className="absolute inset-0 flex flex-col justify-center gap-3 overflow-hidden">
                  <Screenshot src={screenshot1} alt="Song list screen" className="h-auto w-4/5 self-end" />
                  <Screenshot src={screenshot2} alt="In-game screen" className="h-auto w-4/5 self-start" />
                </div>
              </div>
            </Box>

            {/* Its own row rather than a line of text: online play is the newest thing here and the
                one part of the page a visitor is unlikely to go looking for, so it gets a real
                button and the height to be seen. */}
            <Box
              className={`${MenuViewTransition.SING_ONLINE} hidden shrink-0 flex-row items-center justify-start gap-6 p-5 lg:flex`}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Chip variant="orange">Preview</Chip>
                  <Typography className="text-md font-bold uppercase">Sing Online</Typography>
                </div>
                <Typography className="text-sm">
                  Friends not in the room? Host a game they join from their own browser — same songs, same scoring.
                </Typography>
              </div>
              <SmoothLink to="online/" asChild>
                <ButtonLink data-test="sing-online" subtleFocused focused size="small">
                  Host or join an online room
                </ButtonLink>
              </SmoothLink>
            </Box>

            {/* Dropped below `lg` for the same reason the board is: it is neither the pitch nor a
                way into a game, and four song tiles side by side need the width to stay readable. */}
            <RecentlyAddedSongs className="hidden lg:flex" />
          </div>

          {/* Dropped on a phone rather than stacked: it is the one block here that is neither the
              pitch nor a way into a game, and it would push everything else past two screenfuls.

              As a rail (from `xl`) the board fills its grid cell absolutely rather than sitting in
              it: fifty rows are taller than everything to their left, and in flow that height
              becomes the row's, so the whole page scrolls to show a list that can scroll itself.
              Out of flow it has no height to give, the row is as tall as the cards beside it, and
              the list takes what is left and scrolls. Below `xl` there is no second column and the
              board is a block under the cards, where its own five-row height is what it should be. */}
          <div className="relative hidden lg:block">
            <LeaderboardPanel
              className={`${MenuViewTransition.LEADERBOARD} xl:absolute xl:inset-0`}
              listClassName="xl:h-auto xl:min-h-0 xl:flex-1"
            />
          </div>
        </div>

        {/* The phone's call to action, pinned to the bottom of the screen rather than left in the
            card: this page is a screenful of pitch before anything actionable, and a phone reading it
            scrolls past the buttons long before it has decided. A phone is almost always the device
            joining someone else's game, so the two swap roles here — joining takes the primary and
            starting steps back — rather than being restyled copies of the pair inside the card.
            Sticky and not fixed, so at the end of the scroll it settles above the footer instead of
            covering it — and blurred behind, because what it is pinned over is a pair of
            screenshots. */}
        <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-xl bg-black/40 p-2 backdrop-blur-sm sm:flex-row lg:hidden">
          <SmoothLink to="remote-mic/" asChild>
            <PrimaryCta data-test="join-existing-game">
              <span className="flex flex-col items-center leading-tight">
                Join with code
                <span className="text-sm opacity-80">using a game code</span>
              </span>
            </PrimaryCta>
          </SmoothLink>
          <SmoothLink to="quick-setup/" asChild>
            <SecondaryCta data-test="enter-the-game">Start new game</SecondaryCta>
          </SmoothLink>
        </div>

        <MenuFooter />
      </div>
    </>
  );
}

const Screenshot = twx.img`shadow-5 aspect-video w-full rounded-md border-1 border-black object-cover`;

// Orange rather than the app's usual dark button: this is the only screen with a single thing it
// wants the visitor to do, and every other surface here is already a dark card.
const PrimaryCta = twx(ButtonLink)`bg-active! text-shadow-legible w-full`;
const SecondaryCta = twx(ButtonLink)`subtle-focus w-full`;

export default LandingPage;
