const fs = require('fs');
const { PeerServer } = require('peer');

const certPath = './config/crt/dummy.pem';
const keyPath = './config/crt/dummy.key';
const customCert = fs.existsSync(certPath);

if (!customCert) {
  console.log('No custom cert found, some E2E tests might not work. Check README.md how to fix it');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const peerServer = PeerServer({
  port: 3001,
  ...(customCert
    ? {
        ssl: {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        },
      }
    : {}),
});
