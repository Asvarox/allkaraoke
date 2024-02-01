import { PeerJSOption } from 'peerjs';
import isE2E from 'utils/isE2E';

const e2eOverrides: PeerJSOption = isE2E()
  ? {
      host: 'localhost',
      port: 3001,
      path: '/',
    }
  : {};

const options: PeerJSOption = {
  // host: 'localhost',
  // port: '8080',
  // path: '/peerjs',
  // secure: false,
  ...e2eOverrides,
  // debug: 3,
};

export default options;
