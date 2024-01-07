import styled from '@emotion/styled';
import { useBackground } from 'Elements/LayoutWithBackground';
import Logo from 'Elements/Logo';
import { MenuContainer } from 'Elements/Menu';
import RecommendedBrowsers from 'Elements/RecommendedBrowsers';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  supportedBrowsers?: boolean;
}>;
function MenuWithLogo({ children, supportedBrowsers }: Props) {
  useBackground(true);

  return (
    <>
      <GithubRibbon />
      <Container>
        <Logo />
        {supportedBrowsers && <RecommendedBrowsers />}
        <MenuContainer>{children}</MenuContainer>
      </Container>
    </>
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
