import styled from '@emotion/styled';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import Logo from 'modules/Elements/Logo';
import { MenuContainer } from 'modules/Elements/Menu';
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
      <Container>
        <Logo />
        {supportedBrowsers && <RecommendedBrowsers />}
        <MenuContainer>{children}</MenuContainer>
      </Container>
    </LayoutGame>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100vw;
  height: 100vh;
  overflow: auto;
`;

export default MenuWithLogo;
