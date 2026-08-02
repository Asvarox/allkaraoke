# Certificates

These are only used by the **opt-in** HTTPS dev mode (`pnpm start:https`). The default `pnpm start` serves plain HTTP on
`localhost`, which browsers already treat as a secure context - no certificate needed.

HTTPS mode exists for opening the dev server from another device (e.g. a phone used as a remote mic). Such a device
reaches the app via the LAN IP, which is not a secure context, so APIs like `getUserMedia` would otherwise be blocked.

There are 2 types of certificates

## Development certificate

This one you need to generate by yourself and add it to the trusted certificates on your computer. It removes the
certificate warning shown in HTTPS mode - otherwise a self-signed dummy certificate is used and you have to click
through the warning on every device.

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
3. Run the app with `pnpm start:https`

## Dummy certificate

Used by the PeerJS server (that handles setting up connection between the game and remote mic), and as the fallback for
HTTPS mode when no development certificate has been generated.

It is pre-generated for convenience and as such it shouldn't be trusted.
