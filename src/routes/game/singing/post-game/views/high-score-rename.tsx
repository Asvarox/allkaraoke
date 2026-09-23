import { ComponentRef, KeyboardEvent, useRef, useState } from 'react';

import { HighScoreEntity } from '~/interfaces';
import { Input } from '~/modules/elements/input';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';

interface Props {
  index: number;
  singSetupId: string;
  score: HighScoreEntity;
  register: ReturnType<typeof useKeyboardNav>['register'];
  onSave: (singId: string, score: number, oldName: string, newName: string) => void;
}

function HighScoreRename({ score, register, singSetupId, onSave, index }: Props) {
  const inputRef = useRef<ComponentRef<typeof Input>>(null);
  const [newName, setNewName] = useState('');

  const save = (name: string) => {
    // Save the trimmed value, not the raw one — it's what the check above validates against.
    const trimmed = name.trim();
    if (trimmed.length && trimmed !== score.name) onSave(singSetupId, score.score, score.name, trimmed);
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

  // `Input` forwards unknown props to the DOM, so the nav handler is taken out and used here instead
  const { $keyboardNavigationChangeFocus: changeFocus, ...navProps } = register(
    `highscore-rename-${index}`,
    onActive,
    undefined,
    false,
    {
      control: { type: 'text', label: 'Rename', value: newName, placeholder: score.name },
      onValueChange: onRemoteRename,
    },
  ) as ReturnType<Props['register']> & { $keyboardNavigationChangeFocus?: (direction: -1 | 1) => void };

  // Enter commits the name; the arrows leave the field for the row above or below. Either way the
  // blur is what saves it and hands the keyboard back to the list.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') {
      inputRef.current?.element?.blur();
    } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
      inputRef.current?.element?.blur();
      changeFocus?.(e.code === 'ArrowUp' ? -1 : 1);
    }
  };

  return (
    <Input
      className="ph-no-capture [&_input]:lg:text-md h-8 lg:h-10 [&_input]:text-sm"
      onChange={setNewName}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      value={newName}
      label=""
      ref={inputRef}
      {...navProps}
      placeholder={score.name}
      data-test={`input-edit-highscore`}
      data-original-name={score.name}
    />
  );
}

export default HighScoreRename;
