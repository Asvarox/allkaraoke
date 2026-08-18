import { v4 as uuid } from 'uuid';

import { Setting } from '~/routes/settings/settings-state';

/**
 * Stable per-device id used as part of the board's dedupe key. It is a localStorage string the
 * client generates — rotating it defeats the per-client rate limit, which is accepted for v1 (see
 * the design doc's "Abuse Posture").
 */
const ClientIdSetting = new Setting<string | null>('leaderboard-client-id', null);

export const LeaderboardNameSetting = new Setting<string | null>('leaderboard-name', null);
export const LeaderboardCountrySetting = new Setting<string | null>('leaderboard-country', null);

export const getClientId = (): string => {
  const stored = ClientIdSetting.get();
  if (stored) return stored;

  const created = uuid();
  ClientIdSetting.set(created);

  return created;
};

/**
 * Name precedence: a previously submitted name always wins. The player slot name only seeds the
 * field the first time, so renaming a slot mid-party does not silently change the board identity.
 */
export const getPrefilledName = (playerSlotName: string | undefined): string =>
  LeaderboardNameSetting.get() ?? playerSlotName ?? '';

export const getPrefilledCountry = (): string => LeaderboardCountrySetting.get() ?? '';

export const persistIdentity = (name: string, country: string | null) => {
  LeaderboardNameSetting.set(name);
  LeaderboardCountrySetting.set(country);
};
