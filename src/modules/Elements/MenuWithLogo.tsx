import { Menu } from 'modules/Elements/AKUI/Menu';
import { useBackground } from 'modules/Elements/BackgroundContext';
import Logo from 'modules/Elements/Logo';
import RecommendedBrowsers from 'modules/Elements/RecommendedBrowsers';
import { PropsWithChildren } from 'react';
import LayoutGame from 'routes/LayoutGame';
import GithubRibbon from 'routes/Welcome/GithubRibbon';

type Props = PropsWithChildren<{
  supportedBrowsers?: boolean;
}>;

function MenuWithLogo({ children, supportedBrowsers }: Props) {
  useBackground(true);

  return (
    <LayoutGame>
      <GithubRibbon />
      <div className="mobile:gap-4 flex w-screen flex-col items-center gap-8 pt-8">
        <div className="mobile:text-5xl text-6xl">
          <Logo />
        </div>
        {supportedBrowsers && <RecommendedBrowsers />}
        <Menu>{children}</Menu>
      </div>
    </LayoutGame>
  );
}

export default MenuWithLogo;
