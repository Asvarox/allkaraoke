# Global Game State

All game data - players, song, notes, game mode, difficulty - is stores in a global singleton class `GameState`.

Player specific data is kept in separate class, `PlayerState` - which is instanced and accessible via `GameState`.

## Origins

Originally, the game state was kept in React's `useState` hooks. While this made it easy to rerender the components
upon update and clear the state after the game, the data was only available in React context, had to be passed around
with props and to the Canvas render engine and made the FPS of the game coupled with the FPS of the UI. There were also
concerns regarding the performance.

## Solution

Create a singleton object that would contain all the state of the game and how it can be changed.

### Pros

1. The object has no external dependencies such as React (it's just a plain JS class)
2. Can be accessed in any context
3. Can be updated independently (of e.g. the UI)

### Issues

1. A bit harder to update UI (React) state upon state change
   - Right now "addressed" by updating the game time of the UI (kept in `useState`) and `GameState` simultaneously
2. Need to clear its state manually
