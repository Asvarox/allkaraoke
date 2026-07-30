import { FormEventHandler, useEffect, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { Menu } from '~/modules/elements/akui/menu';
import { Input } from '~/modules/elements/input';
import Modal from '~/modules/elements/modal';

interface Props {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function RenameModal({ open, currentName, onClose, onSave }: Props) {
  const [name, setName] = useState(currentName);

  // Reset the field to the current name every time the modal opens
  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} data-test="rename-modal" withPortal>
      <Menu>
        <Menu.Header>Change your name</Menu.Header>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            maxLength={MAX_NAME_LENGTH}
            focused={false}
            label="Your name"
            placeholder="Enter your name…"
            value={name}
            onChange={setName}
            autoFocus
            data-test="rename-input"
          />
          <Menu.Button type="submit" size="small" data-test="rename-save-button">
            Save
          </Menu.Button>
        </form>
      </Menu>
    </Modal>
  );
}
