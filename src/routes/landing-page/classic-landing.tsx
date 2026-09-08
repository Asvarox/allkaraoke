import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';
import Typewriter from 'typewriter-effect';

import { ButtonLink } from '~/modules/elements/akui/button';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import SmoothLink from '~/modules/elements/smooth-link';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import GithubRibbon from '~/routes/welcome/github-ribbon';
import { twx } from '~/utils/twx';

import LogoIcon from './logo-icon';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import songStats from './song-stats.json';

const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/**
 * The landing page as it has always been: the pitch in one column, the screenshots beside it, and a
 * single "Enter the game" button above the fold.
 *
 * The control side of the `new_landing_menu` experiment - see `landing-page.tsx` for the switch and
 * `tiled-landing.tsx` for the test.
 */
function ClassicLanding() {
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

  const [showTypewriter, setShowTypewriter] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTypewriter(true);
    }, 4_000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Helmet>
        <title>AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <GithubRibbon />
      <div className="landscap:w-full landscap:flex-row mx-auto flex min-h-screen w-[72rem] flex-col items-stretch justify-center gap-4 max-lg:h-auto max-lg:w-full [&_a]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)] [&_strong]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)]">
        <div className="flex justify-center gap-6 text-6xl max-lg:hidden">
          <LogoIcon />
          <Logo />
        </div>
        <SmoothLink to={nextPage}>
          <PlayButton data-test="enter-the-game" className="h-26 max-lg:hidden">
            Enter the game
          </PlayButton>
        </SmoothLink>
        <Box className="landscap:flex-1 flex-row gap-6 bg-black/60 p-10 max-lg:flex-col max-lg:rounded-[0] max-lg:p-4 [&_hr]:my-3">
          <StatSegment className="h-full justify-between">
            <div className="max-lg:text-md text-justify text-lg leading-normal">
              <strong>AllKaraoke</strong> is a free online karaoke game inspired by PlayStation&#39;s{' '}
              <strong>SingStar</strong>. Sing along to your favorite songs and compete with your friends, all through
              the browser! Updated almost weekly with new songs and features.
            </div>
            <hr />
            <div className="flex flex-col gap-2">
              <StatText>
                ▸ <strong>{formatter.format(songStats.songs)}</strong> songs in{' '}
                <strong>{songStats.languages.length}</strong> languages
                <StatSubText>
                  Artists such as{' '}
                  <strong>
                    {showTypewriter ? (
                      <Typewriter
                        options={{
                          strings: songStats.artists,
                          autoStart: true,
                          loop: true,
                          delay: 100,
                        }}
                      />
                    ) : (
                      songStats.artists.at(-1)
                    )}
                  </strong>
                </StatSubText>
              </StatText>
              <StatText>
                ▸ Play <strong>directly</strong> in the browser
                <StatSubText>
                  No <strong>download</strong> needed
                </StatSubText>
              </StatText>
              <StatText>
                ▸ Use <strong>phones</strong> as microphones
                <StatSubText>No need to download an app</StatSubText>
              </StatText>
              <StatText>
                ▸ Supports <strong>1-4</strong> players
                <StatSubText>When using phones as microphones</StatSubText>
              </StatText>
              <StatText>
                ▸ <strong>100% Free</strong> and open source
                <StatSubText>
                  Check the{' '}
                  <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
                    GitHub repository
                  </a>
                </StatSubText>
              </StatText>
            </div>
          </StatSegment>
          <StatSegment className="landscap:hidden gap-10 max-lg:flex-row max-lg:gap-2">
            <Screenshot
              src={screenshot1}
              alt="Song list screen"
              className="[box-shadow:_0_0_3rem_rgba(114,155,255,0.5)]"
            />
            <Screenshot src={screenshot2} alt="In-game screen" className="[box-shadow:_0_0_6rem_rgb(19,19,19)]" />
          </StatSegment>
        </Box>
        <Typography className="text-md text-right max-lg:hidden">
          Using this device as remote microphone?{' '}
          <SmoothLink to="remote-mic/">
            <a data-test="join-existing-game">Join existing game</a>
          </SmoothLink>
        </Typography>
        <div className="landscap:flex-1 flex flex-col justify-stretch">
          <div className="landscap:fixed top-0 right-0 left-[calc(50vw+1rem)] flex flex-col gap-6">
            <SmoothLink to="remote-mic/">
              <PlayButton data-test="join-existing-game" className="hidden h-28 max-lg:flex">
                <span className="text-lg">
                  Join game
                  <div className="text-sm">
                    (using <strong>game code</strong>)
                  </div>
                </span>
              </PlayButton>
            </SmoothLink>
            <SmoothLink to="quick-setup/">
              <PlayButton data-test="enter-the-game" className="hidden h-28 !text-lg max-lg:flex">
                Start new game
              </PlayButton>
            </SmoothLink>
          </div>
        </div>
      </div>
    </>
  );
}

const StatText = twx.div`max-lg:text-md text-lg`;
const StatSubText = twx.div`text-md pt-1 text-right max-lg:text-sm [&_.Typewriter]:inline`;

const StatSegment = twx.div`typography flex flex-1 flex-col justify-center text-xl`;

const Screenshot = twx.img`shadow-5 aspect-video w-full rounded-md border-1 border-black/50 object-cover max-lg:w-[calc(50vw_-_1rem)]`;

const PlayButton = twx(ButtonLink)`subtle-focus w-full px-4 py-4 text-5xl max-lg:text-2xl`;

export default ClassicLanding;
