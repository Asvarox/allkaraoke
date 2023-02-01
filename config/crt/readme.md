# Certificates
Some browser APIs (like WebRTC used for RemoteMics) require a site to be served with an SSL (especially when not using
localhost as the address, e.g. on a mobile phone), this file describes how to set it up locally.

There are 2 types of certificates

## Development certificate
This one you need to generate by yourself and add it to the trusted certificates on your computer. This allows a service
worker to be registered locally.

It is not pre-generated and committed as it's probably not safe to trust such "publicly" available certs.

Via https://eengstrom.github.io/musings/self-signed-tls-certs-v.-chrome-on-macos-catalina
1. Generate the cert (in the folder same as this doc file) 
```sh
hostname="localhost"
subject="/C=US/ST=State/L=City/O=Organization/CN=${hostname}"
confdir=$(openssl version -d | awk -F'"' '{print $2}')
filename=server
openssl req \
    -newkey rsa:2048  -nodes  -keyout ${filename}.key \
    -new -x509 -sha256 -days 365 -out ${filename}.pem \
    -subj "${subject}" \
    -extensions SAN -reqexts SAN \
    -config <(cat ${confdir}/openssl.cnf;
              printf "[SAN]\nsubjectAltName=DNS:${hostname}\nextendedKeyUsage=serverAuth")
```
2. Add `server.pem` to trusted certificates (Keychain App on MacOS)
3. Run the app

## Dummy certificate
Used to run the app and PeerJS server (that handles setting up connection between the game and remote mic) for E2E tests.
Otherwise, PeerJS server doesn't offer SSL and the app remote mics aren't able to connect.

It is pre-generated for convenience and as such it shouldn't be trusted.
