const fs = require('fs');
const { PeerServer } = require('peer');

const certPath = './config/crt/dummy.pem';
const keyPath = './config/crt/dummy.key';
const customCert = fs.existsSync(certPath);

if (!customCert) {
    console.log('No custom cert found, some E2E tests might not work. Check README.md how to fix it');
}

const peerServer = PeerServer({
    port: 9000,
    ...(customCert
        ? {
              ssl: {
                  cert: fs.readFileSync(certPath),
                  key: fs.readFileSync(keyPath),
              },
          }
        : {}),
});
