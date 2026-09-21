import { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import RecommendedBrowsers from '~/modules/elements/recommended-browsers';
import LayoutGame from '~/routes/layout-game';
import GithubRibbon from '~/routes/welcome/github-ribbon';

type Props = PropsWithChildren<{
  supportedBrowsers?: boolean;
  /**
   * Rendered to the right of the menu on desktop only. Narrow screens have no room for a second
   * column, so the caller places its own copy inside the menu instead.
   */
  sidePanel?: ReactNode;
}> &
  ComponentProps<typeof Menu>;

function MenuWithLogo({ children, supportedBrowsers, sidePanel, ...props }: Props) {
  useBackground(true);

  return (
    <LayoutGame>
      <GithubRibbon />
      <div className="flex w-screen flex-col items-center gap-8 pt-8 max-lg:gap-4">
        <div className="text-6xl max-lg:text-5xl">
          <Logo />
        </div>
        {supportedBrowsers && <RecommendedBrowsers />}
        {sidePanel ? (
          // The menu and its panel are centered together, as one block: they read as a single
          // surface split in two, so centering the menu alone (and letting the panel hang off one
          // side) would sit the pair visibly off-center under a centered logo.
          //
          // `items-stretch` so the panel is as tall as the menu beside it — a panel hugging its own
          // content next to a full-height card looks like it failed to load. The panel is
          // responsible for filling the height it is given (`h-full`).
          <div className="flex w-full items-stretch justify-center gap-6">
            <Menu {...props}>{children}</Menu>
            {/* The panel is taken out of flow (`absolute inset-0` against this `relative` box) so
                that the menu alone decides how tall the row is. Left in flow it would also *drive*
                the height, and a panel with a long scrolling list — a chat — would grow the whole
                page instead of scrolling inside the space it was given. */}
            <div className="relative hidden w-[31rem] shrink-0 lg:block">
              <div className="absolute inset-0">{sidePanel}</div>
            </div>
          </div>
        ) : (
          <Menu {...props}>{children}</Menu>
        )}
      </div>
    </LayoutGame>
  );
}

export default MenuWithLogo;
