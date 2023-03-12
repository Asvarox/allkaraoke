import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';

class Setting<T> {
    private value: T | undefined = undefined;

    private listeners: Array<(newValue: T) => void> = [];
    public constructor(
        private name: string,
        private defaultValue: T,
        private driver: 'localStorage' | 'sessionStorage' = 'localStorage',
    ) {}

    public get = (): T => {
        if (this.value === undefined) {
            this.value = JSON.parse(window[this.driver].getItem(`settings-${this.name}`)!) ?? this.defaultValue;
        }
        return this.value as T;
    };

    public set = (newValue: T) => {
        this.value = newValue;

        window[this.driver].setItem(`settings-${this.name}`, JSON.stringify(newValue));
        this.listeners.forEach((listener) => listener(newValue));
    };

    public addListener = (newListener: (newValue: T) => void) => {
        this.listeners.push(newListener);

        return () => {
            this.listeners = this.listeners.filter((listener) => listener !== newListener);
        };
    };
}

export const GraphicsLevel = ['high', 'low'] as const;
const GRAPHICS_LEVEL_KEY = 'graphics-level';
export const GraphicSetting = new Setting<ValuesType<typeof GraphicsLevel>>(GRAPHICS_LEVEL_KEY, GraphicsLevel[0]);

export const MicSetupPreference = [null, 'skip', 'remoteMics', 'mics', 'advanced', 'built-in'] as const;
const MIC_SETUP_PREFERENCE_KEY = 'mic-setup-preference';
export const MicSetupPreferenceSetting = new Setting<ValuesType<typeof MicSetupPreference>>(
    MIC_SETUP_PREFERENCE_KEY,
    MicSetupPreference[0],
    'sessionStorage',
);

export const FpsCount = [60, 30] as const;
const FPS_COUNT_KEY = 'fps-count';
export const FPSCountSetting = new Setting<ValuesType<typeof FpsCount>>(FPS_COUNT_KEY, FpsCount[0]);

const EXCLUDED_LANGUAGES_KEY = 'EXCLUDED_LANGUAGES_KEY';
export const ExcludedLanguagesSetting = new Setting<string[] | null>(EXCLUDED_LANGUAGES_KEY, null);

export function useSettingValue<T>(value: Setting<T>) {
    const [currentValue, setCurrentValue] = useState(value.get());

    useEffect(() => {
        return value.addListener(setCurrentValue);
    }, [value]);

    return [currentValue, value.set] as const;
}
