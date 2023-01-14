Via https://eengstrom.github.io/musings/self-signed-tls-certs-v.-chrome-on-macos-catalina
1. Generate the cert
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
