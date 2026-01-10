import { HighScoreEntity } from 'interfaces';
import { Autocomplete } from 'modules/Elements/Autocomplete';
import useRecentPlayerNames from 'modules/hooks/players/useRecentPlayerNames';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import { ComponentRef, useRef, useState } from 'react';

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

  const onBlur = () => {
    if (newName.trim().length && newName.trim() !== score.name) onSave(singSetupId, score.score, score.name, newName);
  };

  const onActive = () => {
    inputRef.current?.element?.focus();
  };

  return (
    <Autocomplete
      className="ph-no-capture [&_button]:mobile:h-8 [&_input]:text-sm"
      options={playerNames}
      onChange={setNewName}
      onBlur={onBlur}
      value={newName}
      label=""
      ref={inputRef}
      {...register(`highscore-rename-${index}`, onActive)}
      placeholder={score.name}
      data-test={`input-edit-highscore`}
      data-original-name={score.name}
    />
  );
}

export default HighScoreRename;
