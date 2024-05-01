import { backgroundTheme } from 'Elements/LayoutWithBackground';
import { milliseconds } from 'interfaces';
import posthog from 'posthog-js';
import { useLayoutEffect, useState } from 'react';
import { ValuesType } from 'utility-types';
import Listener from 'utils/Listener';
import { FeatureFlags } from 'utils/featureFlags';
import storage from 'utils/storage';

class Setting<T> extends Listener<[T]> {
  private value: T | undefined = undefined;

  public constructor(
    private name: string,
    private defaultValue: T,
    private driver: 'local' | 'session' | 'memory' = 'local',
  ) {
    super();
  }

  public get = (): T => {
    if (this.value === undefined) {
      this.value = storage[this.driver].getValue(`settings-${this.name}`)! ?? this.defaultValue;
    }
    return this.value as T;
  };

  public set = (newValue: T) => {
    this.value = newValue;

    storage[this.driver].storeValue(`settings-${this.name}`, newValue);
    this.onUpdate(newValue);
  };
}

export const GraphicsLevel = ['high', 'low'] as const;
const GRAPHICS_LEVEL_KEY = 'graphics-level';
export const GraphicSetting = new Setting<ValuesType<typeof GraphicsLevel>>(GRAPHICS_LEVEL_KEY, GraphicsLevel[0]);

export const MicSetupPreference = [
  null,
  'skip',
  'remoteMics',
  'singstar-mics',
  'different-mics',
  'advanced',
  'built-in',
] as const;
const MIC_SETUP_PREFERENCE_KEY = 'mic-setup-preference';
export const MicSetupPreferenceSetting = new Setting<ValuesType<typeof MicSetupPreference>>(
  MIC_SETUP_PREFERENCE_KEY,
  MicSetupPreference[0],
  'session',
);

export const FpsCount = [60, 30] as const;
export const FPSCountSetting = new Setting<ValuesType<typeof FpsCount>>('fps-count', FpsCount[0]);

export const ExcludedLanguagesSetting = new Setting<string[] | null>('EXCLUDED_LANGUAGES_KEY_V2', null);

export const MobilePhoneModeSetting = new Setting<boolean | null>('MOBILE_PHONE_MODE_KEY', null);
export const KeyboardHelpVisibilitySetting = new Setting<boolean>('keyboard-help-visibility', true);

export const InputLagSetting = new Setting<milliseconds>('INPUT_LAG', 0);

// Used in remote mics
export const RemoteMicrophoneLagSetting = new Setting<milliseconds>('REMOTE_MIC_INPUT_LAG', 0, 'session');

export const RemoteMicPermissions = ['write', 'read'] as const;
export const DefaultRemoteMicPermission = new Setting<ValuesType<typeof RemoteMicPermissions>>(
  'DefaultRemoteMicPermission',
  'write',
);

export const BackgroundMusic = ['New', 'Classic'] as const;
export const BackgroundMusicSetting = new Setting<ValuesType<typeof BackgroundMusic>>(
  'background-music',
  BackgroundMusic[0],
);

export const BackgroundThemeSetting = new Setting<backgroundTheme>('BackgroundThemeSetting', 'regular', 'memory');
export const AutoEnableFullscreenSetting = new Setting<boolean>(
  'AutoEnableFullscreenSetting',
  true,
  process.env.NODE_ENV === 'development' ? 'local' : 'session',
);

export const UseWebsocketsSettings = new Setting<boolean>('UseWebsocketsSettings', false, 'session');

posthog.onFeatureFlags(() => {
  // UseWebsocketsSettings.set(isDev() ? true : (posthog.isFeatureEnabled(FeatureFlags.WebsocketsRemoteMics) ?? false));
  UseWebsocketsSettings.set(posthog.isFeatureEnabled(FeatureFlags.WebsocketsRemoteMics) ?? false);
});

export function useSettingValue<T>(value: Setting<T>) {
  const [currentValue, setCurrentValue] = useState(value.get());

  useLayoutEffect(() => {
    return value.addListener(setCurrentValue);
  }, [value]);

  return [currentValue, value.set] as const;
}
