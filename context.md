# AllKaraoke Glossary

Last updated: 2026-05-16

## Singing and Scoring

- **frequency** — Player voice in Hz, sampled continuously from the input source.
- **frequencyRecord** — A single frequency sample paired with the song timestamp when it was captured.
- **pitch** — Musical note as a number (0 = C0). Derived from frequency.
- **distance** — Semitones between player pitch and target pitch, ignoring octave. A tolerance margin can make small distances count as zero.
- **tolerance** — Allowed pitch error window; configured per sing setup.
- **playerNote** — Group of consecutive `frequencyRecord`s matched (by time and distance) to a song note. Represents the coloured sung lines visible in-game.
- **vibrato** — Pitch oscillation detected on a `playerNote`, contributing a bonus.
- **perfect** — Hit accuracy category used in the detailed score breakdown.

## Song Data Structure

A song is a hierarchy: **Song → tracks → sections → notes**.

- **Song** — Full parsed karaoke object. Contains metadata (artist, title, video, BPM, gap…), the array of `SongTrack`s, and a pre-computed `mergedTrack`.
- **SongPreview** — Lightweight version of `Song` used in song list screens (no full note data).
- **track** (`SongTrack`) — One vocal lane of a song. Duet songs have two named tracks. Each track holds an ordered array of `Section`s and a `changes` array marking where the active singer alternates.
- **mergedTrack** — Synthesised track combining all tracks; used when player count or mode does not map 1-to-1 to tracks (e.g. single-player on a duet song).
- **section** — A segment within a track. Either a `NotesSection` (has singable notes) or a `PauseSection` (instrumental break). Each section carries a `start` beat position.
- **note** — One singable syllable within a `NotesSection`. Has `start` (beat), `length` (beats), `pitch`, `lyrics` text, and a `type`.
- **songBeat** — Beat-based time unit used for all note/section positioning. Converted to milliseconds via BPM and song gap. `songBeat = 0` is the chart origin before the gap offset.
- **gap** — Millisecond offset applied to align the chart start with actual audio/video playback.
- **videoGap** — Additional offset between the start of the video and the moment singing begins.
- **BPM** — Beats per minute as declared in the UltraStar source file, used to compute beat-to-ms conversion.
- **realBpm** — Actual musical tempo when the UltraStar BPM value has been doubled/halved for technical reasons.

### Note types

- **normal (`:`)** — Standard scorable note.
- **star (`*`)** — Golden note; grants bonus points.
- **rap (`R`)** — Judged as hit on any detected singing; reduced points.
- **freestyle (`F`)** — Same hit logic as rap; reduced points.
- **rapstar (`G`)** — Golden rap note variant.

## Input Management

Input is managed through two cooperating singletons:

- **InputSourceListManager** (`src/routes/SelectInput/InputSources/index.ts`) — Maintains the available hardware/virtual input list per source type. Notifies the rest of the app via `inputListChanged` when the device list changes (e.g. a remote mic connects). Input source types: `Microphone`, `Remote Microphone`, `Dummy`.
- **InputManager** (`src/modules/GameEngine/Input/InputManager.ts`) — Per-player facade used during gameplay. Reads from whichever source type the player's `SelectedPlayerInput` points to (resolved through `PlayersManager`). Handles `startMonitoring` / `stopMonitoring` and exposes per-player `frequency`, `volume`, and `inputLag`.
- **SelectedPlayerInput** — Struct `{ source, deviceId, channel }` stored per player that identifies exactly which input to read from.
- **channel** — Index into a multi-channel device (e.g. SingStar mic has channels 0 and 1 for the two colours).
- **input lag** — Per-player configurable delay (ms) applied when mapping a frequency timestamp to a song beat, compensating for device latency.
- **Dummy input** — Silent virtual input used in development/tests instead of a real microphone.
- **DrawingTest input** — Internal test-only input simulating singing via a drawing gesture; not available in production builds.

## Songs, Library, and Content

- **UltraStar .txt** — Source karaoke format parsed by this app.
- **Convert** — Import flow for turning a UltraStar TXT file into a playable song.
- **built-in song** — Song shipped with the main library.
- **local song** — Song stored in the user's own browser.
- **setlist** — Curated named list of songs (by `shortId`) that can be shared via link. Can be editable (users may add songs during selection) or locked.
- **excluded languages** — Per-user language filter; songs in excluded languages are hidden from the song selection screen.
- **jukebox** — Non-scoring song playback mode.

## Remote Microphone and Networking

- **host** — The main game browser session that runs the game and owns the room.
- **remote mic** — A phone/secondary browser acting as microphone input, connected to the host over a network transport.
- **room ID** — Identifier used to pair a remote mic with its host session; prefix determines transport type (`k` = PartyKit, `w` = WebSocket).
- **remote keyboard** — Navigation control surface on the remote mic screen for operating host menus.
- **remote song list** — Delta-based personal favourites list sent from a remote mic to the host.
- **remote mic permissions** — Access level granted to a remote client: `write` (full control) or `read` (limited).
- **readiness confirmation** — Step before a song starts where each remote mic confirms it is ready (required on iOS after a page reload to enable microphone access).
- **PartyKit** — Default transport backend for remote mics (Cloudflare Workers based).
- **WebSockets** — Alternative direct WebSocket transport for remote mics.
- **PeerJS** — Legacy peer-to-peer WebRTC transport, kept for backwards compatibility.

## App Routes

- **Quick Setup** — First-run microphone setup wizard.
- **Select Input** — Assign inputs/microphones to player slots.
- **Manage Songs** — Administer local songs, import, and access setlist editing.
- **Convert** — Import and sync a UltraStar TXT song with a video.
- **Edit Setlists** — Create and manage named setlists.
- **Exclude Languages** — Configure per-user language filter.
- **Settings** — Global settings including remote mic options and calibration.
- **Jukebox** — Playback-only song browsing.

## Deprecated / Legacy

- **Remotion** — Video generation subsystem, deprecated and not to be used.
- **Emotion / css-in-js** — Legacy styling approach; Tailwind CSS is preferred for new code.
