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
      <div className="mobile:gap-4 flex w-screen flex-col items-center gap-8 pt-8">
        <div className="mobile:text-5xl text-6xl">
          <Logo />
        </div>
        {supportedBrowsers && <RecommendedBrowsers />}
        {sidePanel ? (
          <div className="flex w-full items-start justify-center gap-6">
            <Menu {...props}>{children}</Menu>
            <div className="hidden w-[26rem] shrink-0 lg:block">{sidePanel}</div>
          </div>
        ) : (
          <Menu {...props}>{children}</Menu>
        )}
      </div>
    </LayoutGame>
  );
}

export default MenuWithLogo;
