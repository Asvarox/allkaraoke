import { beforeEach, describe, expect, it } from 'vitest';

import InputManager from '~/modules/game-engine/input/input-manager';
import InputInterface from '~/modules/game-engine/input/interface';
import PlayersManager from '~/modules/players/players-manager';

/**
 * Stands in for whatever the players are singing through, recording the transitions it is put
 * through. Its stop can be held open on request - the interesting case is what the manager does
 * while a teardown is still in flight.
 */
const createInput = () => {
  const log: string[] = [];
  let holdStop = false;
  let finishStop: (() => void) | null = null;

  const input: InputInterface = {
    startMonitoring: async (deviceId?: string) => {
      log.push(`start:${deviceId}`);
    },
    stopMonitoring: async (deviceId?: string) => {
      log.push(`stop:${deviceId}`);
      if (!holdStop) return;

      return new Promise<void>((resolve) => {
        finishStop = resolve;
      });
    },
    getInputLag: () => 0,
    getFrequencies: () => [0],
    clearFrequencies: () => undefined,
    getVolumes: () => [0],
    requestReadiness: () => Promise.resolve(true),
    getStatus: () => 'ok',
  };

  return {
    input,
    log,
    holdStop: () => (holdStop = true),
    finishStop: () => {
      holdStop = false;
      finishStop?.();
      finishStop = null;
    },
  };
};

/** Lets every already-queued transition run to completion. */
const settle = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

describe('InputManager monitoring', () => {
  let device: ReturnType<typeof createInput>;

  beforeEach(async () => {
    PlayersManager.getPlayers()
      .map((player) => player.number)
      .forEach((playerNumber) => PlayersManager.removePlayer(playerNumber));
    PlayersManager.addPlayer(0);

    device = createInput();
    InputManager.sourceNameToInput = () => device.input;

    device.log.length = 0;
  });

  it('runs the pipeline for as long as anyone holds it', async () => {
    const release = InputManager.startMonitoring();
    const releaseNested = InputManager.startMonitoring();
    await settle();

    release();
    await settle();

    expect(device.log).not.toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(true);

    releaseNested();
    await settle();

    expect(device.log).toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(false);
  });

  it('treats the same holder id as one hold however often it is taken', async () => {
    InputManager.startMonitoring('the-game');
    InputManager.startMonitoring('the-game');
    await settle();

    await InputManager.stopMonitoring('the-game');
    await settle();

    expect(InputManager.monitoringStarted()).toBe(false);
  });

  it('ignores a release of something that is not held', async () => {
    const release = InputManager.startMonitoring('mine');
    await settle();

    await InputManager.stopMonitoring('someone-elses');
    await settle();

    expect(device.log).not.toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(true);

    release();
    await settle();
  });

  it('survives a hold released and re-taken in the same tick', async () => {
    const release = InputManager.startMonitoring();
    await settle();

    // What React's StrictMode does to every effect in dev.
    release();
    const releaseRemounted = InputManager.startMonitoring();
    await settle();

    expect(device.log).not.toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(true);

    releaseRemounted();
    await settle();
  });

  it('releases the input a player was on when they switch to another', async () => {
    const release = InputManager.startMonitoring();
    await settle();
    device.log.length = 0;

    PlayersManager.getPlayer(0)!.changeInput('Microphone', 0, 'the-new-one');
    await settle();

    expect(device.log).toEqual(['stop:default', 'start:the-new-one']);

    release();
    await settle();
  });

  it('has nothing to bring up to date when nobody is holding the pipeline', async () => {
    await InputManager.reassertMonitoring();
    await settle();

    expect(device.log).toEqual([]);
    expect(InputManager.monitoringStarted()).toBe(false);
  });

  it('starts behind a teardown that is still in flight rather than racing it', async () => {
    device.holdStop();

    const release = InputManager.startMonitoring();
    await settle();

    // The last holder leaves - a screen being navigated away from - and the next one arrives before
    // the teardown it triggered has finished.
    release();
    await settle();
    expect(device.log).toEqual(['start:default', 'stop:default']);

    const releaseNext = InputManager.startMonitoring();
    await settle();

    // Queued behind the teardown rather than running alongside it.
    expect(device.log).toEqual(['start:default', 'stop:default']);

    device.finishStop();
    await settle();

    // The start had to wait: running it alongside the teardown would have left the teardown to
    // finish last and close the devices it had just opened.
    expect(device.log).toEqual(['start:default', 'stop:default', 'start:default']);
    expect(InputManager.monitoringStarted()).toBe(true);

    releaseNext();
    await settle();
  });
});
