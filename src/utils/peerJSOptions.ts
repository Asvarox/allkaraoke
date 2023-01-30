import { PeerJSOption } from 'peerjs';
import isE2E from 'utils/isE2E';

const e2eOverrides: PeerJSOption = isE2E()
    ? {
          host: 'localhost',
          port: 9000,
          path: '/',
      }
    : {};

const options: PeerJSOption = {
    ...e2eOverrides,
    // debug: 3,
};

export default options;
