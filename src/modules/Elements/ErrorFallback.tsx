import styled from '@emotion/styled';
import { Warning } from '@mui/icons-material';
import { FallbackRender } from '@sentry/react';
import localForage from 'localforage';
import { MenuButton } from 'modules/Elements/Menu';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import storage from 'modules/utils/storage';

export const ErrorFallback: FallbackRender = ({ error, resetError }) => {
  return (
    <MenuWithLogo supportedBrowsers>
      <h1>
        <Warning fontSize="large" /> An error occurred :(
      </h1>
      {'message' in (error as any) ? (
        <>
          <h3>The game crashed with following error</h3>
          <Pre>{(error as any).message}</Pre>
        </>
      ) : (
        <h3>The game crashed</h3>
      )}
      <h3>
        Help fix it by reporting what exactly has happened at{' '}
        <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        or{' '}
        <a href="https://www.facebook.com/allkaraoke.party" target="_blank" rel="noreferrer">
          Facebook
        </a>
      </h3>
      <MenuButton onClick={resetError}>Reset Error</MenuButton>
      <h4>If that doesn't help</h4>
      <MenuButton onClick={() => (global.location.href = global.location?.origin)}>Reload the game</MenuButton>
      <h4>If that doesn't help</h4>
      <MenuButton
        onClick={() => {
          if (
            global.confirm(
              'Are you sure? It will delete all custom songs and scores. Before doing that, try opening the game in an private window or another browser to make sure it will actually help',
            )
          ) {
            storage.session.clear();
            storage.local.clear();
            localForage.clear();
            global.location.href = global.location?.origin;
          }
        }}>
        Clear all data
      </MenuButton>
    </MenuWithLogo>
  );
};

export const Pre = styled.span`
  color: white;
  font-family: monospace;
`;
