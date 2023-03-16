# [Karaoke in the browser - play online right now](https://allkaraoke.party/)


## Getting started

### Requirements

1. Node (check `.nvmrc` for version)
2. Yarn

### Install dependencies

```
yarn
```

### Run

```
yarn start
```

#### Run in offline mode

Plays dummy local video instead of YouTube to work properly in offline environments (eg. planes).

```
yarn start:mock
```

#### Localhost service worker
Locally the app runs on HTTPS (with dummy cert) so remote microphones work. This makes the Service Worker not
work due to untrusted origin. See [this document](config/crt/readme.md) how this can be fixed.

### Build for production

```
yarn build
```

## Development
By default, dummy (simulated) microphones are used. You can use whatever other mic.

### Connecting phone mic to dev server
You can just copy the link and open it in a new browser tab or whole new browser. If you want to connect actual phone
to the dev server, you need to run it with `--host` flag, eg `yarn start --host` (and open the actual IP link).

> _Note_ that some songs won't work (YouTube will block the access), probably due to the host being an IP.

## E2E tests
Running against the dev server if it's running by simply running
```
yarn e2e
```
You can run specific test and specific browser, headed or with debug like so
```
yarn e2e --project="chromium" --headed --debug tests/song-list.spec.ts
```
It's also possible to run the tests against prod build (same as in CI) - it makes the tests run slightly faster:
```
yarn e2e:prod
```
For that you might want to keep following command running separately to not have the app built every time tests are run:
```
yarn build:serve
```

## Misc docs

### Terminology:

-   `frequency` - a frequency of player's voice in Hz
-   `frequencyRecord` - object containing frequency and timestamp (of the song) when it was recorded
-   `pitch` - an actual sound (eg A, C, F#) as a number where `0` = C0
-   `section` - either a verse (containing notes) or a "pause section" - A.K.A instrumental part of the song when nothing's sung
-   `note` - a single singable syllabe with assigned target `pitch`, starting beat, length and lyric. Is also one of several types (see below)
-   `distance` - a number of pitches between player's note pitch and target note pitch, disregarding the octave (so for example player's note C0 has distance 0 to note's target pitch of C4). Note a tolerance can apply - eg with tolerance of 1, distance between pitches 66 and 65 will be 0 (while between 67 and 65 would be 2)
-   `playerNote` - group of `frequencyRecords` recorded directly after eachother, matched (by time) to a note with the same distance to it. Basically represents the player sung lines shown in the game

### Note types

-   `normal` - regular note
-   `star` - golden note, gives bonus points
-   `rap` / `freestyle` - notes that are always hit if any singing is detected. Gives reduced points

### Run unit tests

```
yarn test
```
