import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import { Song } from '~/interfaces';
import { Checkbox } from '~/modules/elements/akui/checkbox';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import { InputLagSetting } from '~/routes/settings/settings-state';

interface Props {
  song: Song | null;
  onExit?: () => void;
  register: ReturnType<typeof useKeyboardNav>['register'];
  isUnverifiedSong?: boolean;
}

type reportTypes = 'not-in-sync' | 'too-loud' | 'too-quiet' | 'bad-lyrics';

export default function RateSong({ register, onExit, song, isUnverifiedSong = false }: Props) {
  const newVolumeFFEnabled = useFeatureFlag(FeatureFlags.NewVolume);
  const menuRef = useRef<null | HTMLButtonElement>(null);
  const [issues, setIssues] = useState<reportTypes[]>([]);

  const volume = newVolumeFFEnabled ? (song?.volume ?? song?.manualVolume) : song?.manualVolume;

  const toggleIssue = (issue: reportTypes) => {
    setIssues((current) => {
      let newValues = current;
      if (current.includes(issue)) {
        newValues = current.filter((i) => i !== issue);
      } else {
        newValues = [...current, issue];
      }
      if (issue === 'too-quiet') {
        newValues = newValues.filter((i) => i !== 'too-loud');
      } else if (issue === 'too-loud') {
        newValues = newValues.filter((i) => i !== 'too-quiet');
      }
      return newValues;
    });
  };

  const isSelected = (issue: reportTypes) => issues.includes(issue);

  useEffect(() => {
    menuRef.current?.focus();
  }, [menuRef]);

  const handleRate = () => {
    const song = GameState.getSong();
    const properties = {
      songId: song?.id,
      sharedSongId: song?.sharedSongId,
      songLastUpdated: song?.lastUpdate,
      inputLag: InputLagSetting.get(),
      completionPercentage: GameState.getSongCompletionProgress(),
    };

    if (isUnverifiedSong) {
      posthog.capture('rate-unverified-song', {
        issues,
        feedbackType: issues.length ? 'bad' : 'ok',
        isExternalUnverifiedSong: true,
        ...properties,
      });
    } else if (issues.length) {
      posthog.capture('rate-song', { issues, ...properties });
    }
    onExit?.();
  };

  const anySelected = issues.length > 0;
  const isTooQuietDisabled = !!volume && volume > 0.95;

  return (
    <>
      <Menu data-test={'rate-song-container'} title="Is the song OK?">
        <Menu.SubHeader>If there&#39;s something wrong with the song, let me know so I can fix it</Menu.SubHeader>
        <Checkbox
          checked={isSelected('not-in-sync')}
          {...register('button-not-in-sync', () => toggleIssue('not-in-sync'))}
          size={'small'}>
          <span>Lyrics are not in sync</span>
        </Checkbox>
        <Checkbox
          checked={isSelected('bad-lyrics')}
          {...register('button-bad-lyrics', () => toggleIssue('bad-lyrics'))}
          size={'small'}>
          <span>Wrong lyrics, missing spaces etc.</span>
        </Checkbox>
        <Checkbox
          checked={isSelected('too-quiet')}
          {...register('button-too-quiet', () => toggleIssue('too-quiet'), undefined, false, {
            disabled: isTooQuietDisabled,
          })}
          size={'small'}
          disabled={isTooQuietDisabled}>
          <span className={isTooQuietDisabled ? 'line-through' : ''}>Too quiet</span>{' '}
          {isTooQuietDisabled && <span className="text-sm"> (already as loud as it could be)</span>}
        </Checkbox>
        <Checkbox
          checked={isSelected('too-loud')}
          {...register('button-too-loud', () => toggleIssue('too-loud'))}
          size={'small'}>
          <span>Too loud</span>
        </Checkbox>
        <hr />
        <MenuButton {...register('button-song-ok', handleRate, undefined, true)} ref={menuRef}>
          {anySelected ? 'Submit and exit' : 'All good, exit the song'}
        </MenuButton>
      </Menu>
    </>
  );
}
