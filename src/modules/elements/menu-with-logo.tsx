import { ComponentProps, PropsWithChildren } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import RecommendedBrowsers from '~/modules/elements/recommended-browsers';
import LayoutGame from '~/routes/layout-game';
import GithubRibbon from '~/routes/welcome/github-ribbon';

type Props = PropsWithChildren<{
  supportedBrowsers?: boolean;
}> &
  ComponentProps<typeof Menu>;

function MenuWithLogo({ children, supportedBrowsers, ...props }: Props) {
  useBackground(true);

  return (
    <LayoutGame>
      <GithubRibbon />
      <div className="mobile:gap-4 flex w-screen flex-col items-center gap-8 pt-8">
        <div className="mobile:text-5xl text-6xl">
          <Logo />
        </div>
        {supportedBrowsers && <RecommendedBrowsers />}
        <Menu {...props}>{children}</Menu>
      </div>
    </LayoutGame>
  );
}

export default MenuWithLogo;
