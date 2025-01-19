import { Menu } from 'modules/Elements/AKUI/Menu';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
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
      <div className="flex h-screen w-screen flex-col items-center gap-8">
        <Logo />
        {supportedBrowsers && <RecommendedBrowsers />}
        <Menu>{children}</Menu>
      </div>
    </LayoutGame>
  );
}

export default MenuWithLogo;
