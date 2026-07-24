import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';

import { Song } from '~/interfaces';
import { Menu } from '~/modules/elements/akui/menu';
import { NavButton, NavCheckbox, NavRemoteControl } from '~/modules/elements/nav-controls';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import { InputLagSetting } from '~/routes/settings/settings-state';

interface Props {
  song: Song | null;
  onExit?: () => void;
  /** Returns to the pause-menu list (the phone's "Back" on the mirrored keyboard). */
  onBack: () => void;
  register: ReturnType<typeof useKeyboardNav>['register'];
  isUnverifiedSong?: boolean;
}

type reportTypes = 'not-in-sync' | 'too-loud' | 'too-quiet' | 'bad-lyrics';

export default function RateSong({ register, onExit, onBack, song, isUnverifiedSong = false }: Props) {
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
        <NavCheckbox
          nav={register}
          name="button-not-in-sync"
          label="Lyrics are not in sync"
          checked={isSelected('not-in-sync')}
          onClick={() => toggleIssue('not-in-sync')}
          size={'small'}>
          <span>Lyrics are not in sync</span>
        </NavCheckbox>
        <NavCheckbox
          nav={register}
          name="button-bad-lyrics"
          label="Wrong lyrics, missing spaces etc."
          checked={isSelected('bad-lyrics')}
          onClick={() => toggleIssue('bad-lyrics')}
          size={'small'}>
          <span>Wrong lyrics, missing spaces etc.</span>
        </NavCheckbox>
        <NavCheckbox
          nav={register}
          name="button-too-quiet"
          label="Too quiet"
          checked={isSelected('too-quiet')}
          onClick={() => toggleIssue('too-quiet')}
          disabled={isTooQuietDisabled}
          size={'small'}>
          <span className={isTooQuietDisabled ? 'line-through' : ''}>Too quiet</span>{' '}
          {isTooQuietDisabled && <span className="text-sm"> (already as loud as it could be)</span>}
        </NavCheckbox>
        <NavCheckbox
          nav={register}
          name="button-too-loud"
          label="Too loud"
          checked={isSelected('too-loud')}
          onClick={() => toggleIssue('too-loud')}
          size={'small'}>
          <span>Too loud</span>
        </NavCheckbox>
        <hr />
        <NavButton
          nav={register}
          name="button-song-ok"
          remoteLabel={anySelected ? 'Submit and exit' : 'All good, exit'}
          remoteIcon="confirm"
          isDefault
          onClick={handleRate}
          ref={menuRef}>
          {anySelected ? 'Submit and exit' : 'All good, exit the song'}
        </NavButton>
        {/* Remote-only: the on-screen rate view has no back button (host uses Backspace); give the
            phone a way back to the pause-menu list. */}
        <NavRemoteControl
          nav={register}
          name="rate-song-back"
          control={{ type: 'button', label: 'Back', variant: 'back' }}
          onClick={onBack}
        />
      </Menu>
    </>
  );
}
