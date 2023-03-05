# Remote microphones

## Frequency throttling
Sending an event to the host for each frequency creates a lot of events (~160/s). On some phones (eg. Android) it
creates congestion, and some events get lost - notably keyboard control ones.

Therefore, the frequencies are sent periodically (~15/s) to the host. Since sending a single frequency
every 75ms reduces the accuracy of singing (which affects eg. vibrato detection), they are instead sent in bulk
containing all the detected frequencies after last bulk was sent.

On the host side, once it receives the package, it "restores" the player notes and frequencies back to the state 
when the last package was received (or to clean state if it is the first one), recalculates notes based on the
received frequencies and stores the state. In between the packages, last frequency received is used as to try to
guess and extrapolate frequencies (to be replaced with actual frequencies once they are received).
