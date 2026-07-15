import { PeerJSOption } from 'peerjs';

import isE2E from '~/modules/utils/is-e2-e';

const e2eOverrides: PeerJSOption = isE2E()
  ? {
      host: 'localhost',
      port: 3001,
      path: '/',
    }
  : {};

const options: PeerJSOption = {
  host: import.meta.env.VITE_APP_BACKEND_HOST,
  // port: 8080,
  path: '/peerjs',
  secure: true,
  ...e2eOverrides,
  // debug: 3,
};

console.log(options);
export default options;
