import { Warning } from '@mui/icons-material';
import { FallbackRender } from '@sentry/react';
import localForage from 'localforage';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { MenuButton } from '~/modules/Elements/Menu';
import MenuWithLogo from '~/modules/Elements/MenuWithLogo';
import storage from '~/modules/utils/storage';

export const ErrorFallback: FallbackRender = ({ error, resetError }) => {
  const errorObj = error as object;

  return (
    <MenuWithLogo supportedBrowsers>
      <Menu.Header>
        <Warning fontSize="large" /> An error occurred :(
      </Menu.Header>
      {'message' in errorObj ? (
        <>
          <span className="typography text-lg">The game crashed with following error</span>
          <pre className="font-mono text-white">{errorObj.message as string}</pre>
        </>
      ) : (
        <span className="typography text-lg">The game crashed</span>
      )}
      <span className="typography text-lg">
        Help fix it by reporting what exactly has happened at{' '}
        <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        or{' '}
        <a href="https://www.facebook.com/allkaraoke.party" target="_blank" rel="noreferrer">
          Facebook
        </a>
      </span>
      <MenuButton onClick={resetError}>Reset Error</MenuButton>
      <Menu.HelpText>If that doesn&#39;t help</Menu.HelpText>
      <MenuButton onClick={() => (global.location.href = global.location?.origin)}>Reload the game</MenuButton>
      <Menu.HelpText>If that doesn&#39;t help</Menu.HelpText>
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
