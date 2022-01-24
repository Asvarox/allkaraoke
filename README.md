## Getting started

### Requirements

1. Node (14+)
2. Yarn
3. A microphone (best with SingStar ones)

### Install dependencies

```
yarn
```

### Run

```
yarn start
```

### Build for production

```
yarn build
```

## Development

### Simulating microphone

Instead of having to sing every time you'd like to test something, you can mock the input.

Edit `src/Scenes/Game/Singing/GameState/GameState.ts` and assign `DummyInput` into the `Input` variable

```
const Input = DummyInput;
const Input1 = MicInput;
```

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
