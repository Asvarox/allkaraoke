# Remote microphones

## How they work
1. Karaoke game (opened in the browser, `host`) connects to [PeerJS](https://peerjs.com/) with a generated UUID
2. Remote Microphone device (`remote mic`, usually a mobile phone) scans the QR code with the link to a "`remote mic` page"
   containing the UUID of the `host`
3. Once the players clicks "Connect" button on the page, the device connects to PeerJS server and tries to connect to the `host`
4. When the connection is successful, `host` might send a couple of "current state" events (e.g. if the device connected
   is already selected as a microphone, current remote keyboard options etc.

## Features

### Microphone
Primary job of the functionality is to enable players to individually compete without special hardware (e.g. microphones).

Internally, the `remote mic` analyses the device's microphone input during singing, computes the frequency and sends
the results over to the `host`. This way host doesn't have to compute the frequency for potentially multiple inputs,
reducing the load.

#### Frequency throttling
Sending an event to the host for each frequency creates a lot of events (~160/s). On some phones (eg. Android) it
creates congestion, and some events get lost - notably keyboard control ones.

Therefore, the frequencies are sent periodically (~15/s) to the host. Since sending a single frequency
every 75ms reduces the accuracy of singing (which affects eg. vibrato detection), they are instead sent in bulk
containing all the detected frequencies after last bulk was sent.

On the host side, once it receives the package, it "restores" the player notes and frequencies back to the state 
when the last package was received (or to clean state if it is the first one), recalculates notes based on the
received frequencies and stores the state. In between the packages, last frequency received is used as to try to
guess and extrapolate frequencies (to be replaced with actual frequencies once they are received).

### Connection stability
There are a couple of mechanisms in place to make the connection between `host` and `remote mic` as smooth as possible

#### Preserving UUIDs
Randomised UUIDs for both `host` and `remote mic` are preserved so in case of a refresh of either, they don't change and
the counterpart can easily reconnect. Since `remote mic`'s UUID is used as a selected input ID, after reconnection the
assigment is preserved.

#### Auto reconnect
If `host` disconnects from `remote mic` (e.g. due to page refresh), the latter will periodically attempt to reconnect.

#### Auto refresh `remote mic` before singing
Before a song is started, `host` broadcasts a request to all connected `remote mic`s to reload the page (Ctrl + R).
The reason for that is to clean the state of the devices in case of e.g. a memory leak. After such requested reload,
`remote mic` auto-reconnects to the `host`

#### Confirm readiness before singing
If there are any players using remote mic, before a song can start they need to confirm that they are ready.

The reason behind this feature is that some devices (like iPhone) require user to allow access to the microphone
after the page is refreshed. The confirmation step gives the player an opportunity to make sure they're actually 
ready to sing.  

### Keyboard
To make it easier to get around the game menus, it's also possible to navigate it using the remote device. When a 
keyboard layout changes in the game, an event is broadcast to every connected device describing it (e.g. which
buttons should be enabled).

Additionally, players are able to assign themselves to specific player slots (blue/red).

Currently, there are no mechanisms for blocking griefing (e.g. taking over player slots or navigating randomly).

The functionality could be extended to provide more customised keyboard layouts for specific pages - for example,
pause manu only has couple actions (pause/end/resume) and they could be directly shown on the device instead of
top/down arrow buttons + Enter.
