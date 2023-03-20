import styled from '@emotion/styled';
import { MenuContainer } from 'Elements/Menu';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import Logo from 'Elements/Logo';
import RecommendedBrowsers from 'Elements/RecommendedBrowsers';
import { useBackground } from 'Elements/LayoutWithBackground';
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
`;

export default MenuWithLogo;
