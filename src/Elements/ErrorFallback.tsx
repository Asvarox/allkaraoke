import styled from '@emotion/styled';
import { Warning } from '@mui/icons-material';
import { FallbackRender } from '@sentry/react';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import localForage from 'localforage';
import Logo from './Logo';
import styles from 'styles';

export const ErrorFallback: FallbackRender = ({ error, resetError }) => {
    return (
        <LayoutWithBackground>
            <Container>
                <Logo />
                <MenuContainer>
                    <h1>
                        <Warning fontSize="large" /> An error occurred :(
                    </h1>
                    <h3>The game crashed with following error</h3>
                    <Pre>{error.message}</Pre>
                    <h3>
                        Help me fix it by reporting what exactly has happened at{' '}
                        <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                    </h3>
                    <MenuButton onClick={resetError}>Reset Error</MenuButton>
                    <h4>If that doesn't help</h4>
                    <MenuButton onClick={() => (window.location.href = window.location.origin)}>
                        Reload the game
                    </MenuButton>
                    <h4>If that doesn't help</h4>
                    <MenuButton
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure? It will delete all custom songs and scores. Before doing that, try opening the game in an private window or another browser to make sure it will actually help',
                                )
                            ) {
                                sessionStorage.clear();
                                localStorage.clear();
                                localForage.clear();
                                window.location.href = window.location.origin;
                            }
                        }}>
                        Clear all data
                    </MenuButton>
                </MenuContainer>
            </Container>
        </LayoutWithBackground>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    ${styles};
`;

export const Pre = styled.span`
    color: white;
    font-family: monospace;
`;
