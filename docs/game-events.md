# Game Events
A simple system of defined events that can either be dispatched or subscribed to.

## Origins
Originally they were used to trigger specific animations/particles in in-game renderer (e.g. exploding notes), thus
the name "Game State" events. The idea was to decouple game logic from rendering, which made it necessary to be as
simple and lightweight as possible (that's why there's a custom implementation instead of something like RxJS or 
custom DOM events).

Over time more UI related events were added (input changes, remote mic connections and so on), with additional hooks
being implemented to be able to handle and act upon these events. This effectively means that the events are now an
integration layer between game state/renderer and React UI.

## Issues
It's not clear where are the changes coming from with this level of decoupling (what triggered which event).
