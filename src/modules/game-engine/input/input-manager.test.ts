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
      log.push(deviceId === undefined ? 'start' : `start:${deviceId}`);
    },
    stopMonitoring: async (deviceId?: string) => {
      log.push(deviceId === undefined ? 'stop' : `stop:${deviceId}`);
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

    // The manager is a singleton, so start each test from a pipeline that is known to be off.
    await InputManager.stopMonitoring();
    device.log.length = 0;
  });

  it('keeps the pipeline running while anyone still holds it', async () => {
    const release = InputManager.requestMonitoring();
    const releaseNested = InputManager.requestMonitoring();
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

  it('survives a hold released and re-taken in the same tick', async () => {
    const release = InputManager.requestMonitoring();
    await settle();

    // What React's StrictMode does to every effect in dev.
    release();
    const releaseRemounted = InputManager.requestMonitoring();
    await settle();

    expect(device.log).not.toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(true);

    releaseRemounted();
    await settle();
  });

  it('does not stop a pipeline it was not the one to start', async () => {
    await InputManager.startMonitoring();

    const release = InputManager.requestMonitoring();
    await settle();
    release();
    await settle();

    expect(device.log).not.toContain('stop:default');
    expect(InputManager.monitoringStarted()).toBe(true);
  });

  it('releases the input the caller had when it asked, not the one it is switching to', async () => {
    const release = InputManager.requestMonitoring();
    await settle();
    device.log.length = 0;

    // What PlayersManager.changeInput() does: stop monitoring, then swap the input over.
    const stopped = InputManager.stopMonitoring();
    PlayersManager.getPlayer(0)!.input = { source: 'Microphone', deviceId: 'the-new-one', channel: 0 };
    await stopped;
    await settle();

    expect(device.log).toEqual(['stop:default']);

    release();
    await settle();
  });

  it('starts behind a stop that is still in flight rather than racing it', async () => {
    device.holdStop();

    const release = InputManager.requestMonitoring();
    await settle();

    // The last holder leaves - a screen being navigated away from - and the next one arrives before
    // the teardown it triggered has finished.
    release();
    await settle();
    expect(device.log).toEqual(['start:default', 'stop:default']);

    const releaseNext = InputManager.requestMonitoring();
    await settle();

    // Queued behind the teardown rather than running alongside it.
    expect(device.log).toEqual(['start:default', 'stop:default']);

    device.finishStop();
    await settle();

    // The start had to wait: running it alongside the stop would have left the teardown to finish
    // last and close the devices it had just opened.
    expect(device.log).toEqual(['start:default', 'stop:default', 'start:default']);
    expect(InputManager.monitoringStarted()).toBe(true);

    releaseNext();
    await settle();
  });
});
