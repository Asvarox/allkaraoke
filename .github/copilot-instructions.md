# AllKaraoke - AI Coding Instructions

## Project Overview

Browser-based karaoke game (React 19 + TypeScript + Vite) supporting YouTube video playback, real-time pitch detection from microphones, and multiplayer via remote phone microphones using PartyKit (Cloudflare Workers).

## Architecture

### Global State: `GameState` Singleton

Game state is NOT in React - it's in `src/modules/GameEngine/GameState/GameState.ts`. This singleton holds song data, player states, scores, and timing. React components sync with it via `GameState.setCurrentTime()` updates. This decouples game FPS from UI FPS.

### Event System

`src/modules/GameEvents/GameEvents.ts` implements a pub/sub system for decoupling game logic from UI. Events handle remote mic connections, input changes, section transitions, etc. Use `events.eventName.dispatch()` to emit and `useEventEffect(events.eventName, handler)` hook to subscribe in React.

### Input System

`src/modules/GameEngine/Input/InputManager.ts` manages multiple input sources (local mics, remote mics, drawing test). Players are assigned inputs via `PlayersManager`. Frequency detection uses `aubiojs`.

### Remote Microphones

Phones connect via PartyKit (built on Cloudflare Workers). The phone detects pitch locally and sends frequency data in batches (~15/s) to reduce latency. See [docs/remote-mic.md](docs/remote-mic.md) for protocol details.

## Key Conventions

### File Structure

- `src/routes/` - Page components matching URL paths defined in `routePaths.ts`
- `src/modules/` - Reusable modules (GameEngine, Songs, Elements, hooks)
- `src/modules/Elements/AKUI/` - Custom UI component library (uses `react-twc` for Tailwind variants)
- `tests/PageObjects/` - Page Object pattern for E2E tests

### Styling

- **Tailwind CSS 4** with `react-twc` for component variants: `twc(Box)\`...\``
- **MUI** only for song management screens (song list table, song editor, setlist management)
- ⚠️ **Avoid Emotion/css-in-js** - legacy code exists but prefer Tailwind for new work

### Testing Patterns

- **E2E (Playwright)**: Use `data-test` attribute for selectors (`testIdAttribute: 'data-test'`)
- **Page Objects**: All E2E page interactions go through `tests/PageObjects/*.ts`
- **Mock songs**: Tests use fixtures from `tests/fixtures/songs/*.txt` via `mockSongs()` helper
- **Simulated devices**: Use `stubUserMedia()` to mock microphone/media devices

### Song Format

Songs use UltraStar `.txt` format. Key types in `src/interfaces.ts`:

- `Song` - Full song with notes, tracks, metadata
- `SongPreview` - Lightweight preview for lists
- `Note` types: `normal`, `star` (golden/bonus), `rap`, `freestyle`

### Feature Flags

Feature toggles via PostHog in `src/modules/utils/featureFlags.ts`. Access with `useFeatureFlag(FeatureFlags.FlagName)`.

## Deprecated (Do Not Use)

- **Remotion** (`src/videos/`, `remotion.config.ts`) - video generation is deprecated
- **Emotion/css-in-js** - use Tailwind CSS instead

## Commands

```bash
pnpm start           # Dev server (HTTPS, simulated mics)
pnpm start:mock      # Offline mode with dummy video
pnpm test            # Unit tests (Vitest)
pnpm e2e             # E2E against dev server
pnpm e2e:prod        # E2E against production build
pnpm lint            # ESLint
pnpm storybook       # Component stories
```

### E2E Specific Tests

```bash
pnpm e2e --project="chromium" --headed tests/sing-a-song.spec.ts
```

## Terminology (from README)

- `frequency` - Player's voice in Hz
- `pitch` - Musical note as number (0 = C0)
- `distance` - Semitones between player pitch and target pitch (ignoring octave)
- `playerNote` - Grouped frequency records matched to a song note
- `section` - Verse (with notes) or pause (instrumental break)
- `songBeat` - Beat position in song (timing unit)

## Path Aliases

TypeScript paths resolve from `./src` (e.g., `import X from '~/modules/...'`).
