import styled from '@emotion/styled';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import { twc } from 'react-twc';
import { Song } from '~/interfaces';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { MenuButton } from '~/modules/Elements/Menu';
import GameState from '~/modules/GameEngine/GameState/GameState';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { FeatureFlags } from '~/modules/utils/featureFlags';
import useFeatureFlag from '~/modules/utils/useFeatureFlag';
import { InputLagSetting } from '~/routes/Settings/SettingsState';

interface Props {
  song: Song | null;
  onExit?: () => void;
  register: ReturnType<typeof useKeyboardNav>['register'];
}

type reportTypes = 'not-in-sync' | 'too-loud' | 'too-quiet' | 'bad-lyrics';

export default function RateSong({ register, onExit, song }: Props) {
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
      songLastUpdated: song?.lastUpdate,
      inputLag: InputLagSetting.get(),
    };
    if (issues.length) {
      posthog.capture('rate-song', { issues, ...properties });
    }
    onExit?.();
  };

  const anySelected = issues.length > 0;
  const isTooQuietDisabled = !!volume && volume > 0.95;

  return (
    <>
      <Menu data-test={'rate-song-container'} title="Is the song OK?">
        <h4>If there&#39;s something wrong with the song, let me know so I can fix it</h4>
        <Checkbox {...register('button-not-in-sync', () => toggleIssue('not-in-sync'))} size={'small'}>
          <Check>{isSelected('not-in-sync') ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
          <span>Lyrics are not in sync</span>
        </Checkbox>
        <Checkbox {...register('button-bad-lyrics', () => toggleIssue('bad-lyrics'))} size={'small'}>
          <Check>{isSelected('bad-lyrics') ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
          <span>Wrong lyrics, missing spaces etc.</span>
        </Checkbox>
        <Checkbox
          {...register('button-too-quiet', () => toggleIssue('too-quiet'), undefined, false, {
            disabled: isTooQuietDisabled,
          })}
          size={'small'}
          disabled={isTooQuietDisabled}>
          <Check>{isSelected('too-quiet') ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
          <span className={isTooQuietDisabled ? 'line-through' : ''}>Too quiet</span>{' '}
          {isTooQuietDisabled && <span className="text-2xl"> (already as loud as it could be)</span>}
        </Checkbox>
        <Checkbox {...register('button-too-loud', () => toggleIssue('too-loud'))} size={'small'}>
          <Check>{isSelected('too-loud') ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
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

// todo make it a generic component
const Checkbox = twc(MenuButton)`gap-4 justify-start pl-4`;

const Check = styled.div`
  svg {
    width: 3rem;
    height: 3rem;
  }
  display: flex;
  align-items: center;
  justify-content: center;
`;
