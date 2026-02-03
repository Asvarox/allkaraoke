import { ComponentProps, PropsWithChildren } from 'react';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import Logo from '~/modules/Elements/Logo';
import RecommendedBrowsers from '~/modules/Elements/RecommendedBrowsers';
import LayoutGame from '~/routes/LayoutGame';
import GithubRibbon from '~/routes/Welcome/GithubRibbon';

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
