import { FormEventHandler, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { Input } from '~/modules/elements/input';
import { MenuButton } from '~/modules/elements/menu';

interface Props {
  initialName: string;
  onComplete: (name: string) => void;
}

// Only rendered when there's no remembered name to skip straight past — see ConnectionWizard
export default function StepSetName({ initialName, onComplete }: Props) {
  const [name, setName] = useState(initialName);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onComplete(name.trim() || initialName);
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center">
      <form className="flex w-full flex-col gap-4 md:gap-8" onSubmit={handleSubmit}>
        <Input
          maxLength={MAX_NAME_LENGTH}
          focused={false}
          label="Your name"
          placeholder="Enter your name…"
          value={name}
          onChange={setName}
          autoFocus
          data-test="player-name-input"
        />
        <MenuButton className="h-24" type="submit" data-test="confirm-name-button">
          Continue
        </MenuButton>
      </form>
    </div>
  );
}
