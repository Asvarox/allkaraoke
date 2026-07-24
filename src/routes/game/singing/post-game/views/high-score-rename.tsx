import { ComponentRef, useRef, useState } from 'react';

import { HighScoreEntity } from '~/interfaces';
import { Autocomplete } from '~/modules/elements/autocomplete';
import useRecentPlayerNames from '~/modules/hooks/players/use-recent-player-names';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';

interface Props {
  index: number;
  singSetupId: string;
  score: HighScoreEntity;
  register: ReturnType<typeof useKeyboardNav>['register'];
  onSave: (singId: string, score: number, oldName: string, newName: string) => void;
}

function HighScoreRename({ score, register, singSetupId, onSave, index }: Props) {
  const inputRef = useRef<ComponentRef<typeof Autocomplete>>(null);
  const [newName, setNewName] = useState('');
  const playerNames = useRecentPlayerNames();

  const save = (name: string) => {
    if (name.trim().length && name.trim() !== score.name) onSave(singSetupId, score.score, score.name, name);
  };

  const onBlur = () => save(newName);

  const onActive = () => {
    inputRef.current?.element?.focus();
  };

  // A name edited on the remote mic arrives here: mirror it into the on-screen field and persist it
  // right away (the phone never "blurs", so we can't wait for onBlur to save it).
  const onRemoteRename = (name: string) => {
    setNewName(name);
    save(name);
  };

  return (
    <Autocomplete
      className="ph-no-capture [&_input]:lg:text-md [&_button]:h-8 [&_button]:lg:h-10 [&_input]:text-sm"
      options={playerNames}
      onChange={setNewName}
      onBlur={onBlur}
      value={newName}
      label=""
      ref={inputRef}
      {...register(`highscore-rename-${index}`, onActive, undefined, false, {
        control: { type: 'text', label: 'Rename', value: newName, placeholder: score.name },
        onValueChange: onRemoteRename,
      })}
      placeholder={score.name}
      data-test={`input-edit-highscore`}
      data-original-name={score.name}
    />
  );
}

export default HighScoreRename;
