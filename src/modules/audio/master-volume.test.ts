import { getMasterGain, subscribeToMasterGain, toggleMasterMute } from '~/modules/audio/master-volume';
import { MasterMutedSetting, MasterVolumeSetting } from '~/routes/settings/settings-state';

describe('master volume', () => {
  beforeEach(() => {
    MasterVolumeSetting.set(1);
    MasterMutedSetting.set(false);
  });

  it('scales by the volume and drops to zero when muted', () => {
    MasterVolumeSetting.set(0.4);
    expect(getMasterGain()).toBe(0.4);

    toggleMasterMute();
    expect(getMasterGain()).toBe(0);

    toggleMasterMute();
    expect(getMasterGain()).toBe(0.4);
  });

  it('notifies subscribers immediately and on every change until unsubscribed', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToMasterGain(callback);
    expect(callback).toHaveBeenLastCalledWith(1);

    MasterVolumeSetting.set(0.5);
    expect(callback).toHaveBeenLastCalledWith(0.5);
    toggleMasterMute();
    expect(callback).toHaveBeenLastCalledWith(0);

    unsubscribe();
    callback.mockClear();
    MasterVolumeSetting.set(0.2);
    expect(callback).not.toHaveBeenCalled();
  });
});
