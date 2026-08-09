import { useEffect, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { Menu } from '~/modules/elements/akui/menu';
import { Input } from '~/modules/elements/input';
import Modal from '~/modules/elements/modal';
import { PlayerColorPicker } from '~/modules/elements/player-color-picker';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import { PLAYER_NUMBERS, PlayerNumber } from '~/modules/players/player-number';
import { setStoredOnlineName } from '~/routes/online/hooks/use-online-name';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  open: boolean;
  onClose: () => void;
  self: OnlineParticipant | undefined;
  participants: OnlineParticipant[];
}

/** Change your display name and color (colors map to player numbers, one singer each). */
function CustomizeModal({ open, onClose, self, participants }: Props) {
  const [name, setName] = useState(self?.name ?? '');
  const [theme] = useSettingValue(BackgroundThemeSetting);

  useEffect(() => {
    if (open) setName(self?.name ?? '');
  }, [open, self?.name]);

  const { register } = useKeyboardNav({ enabled: open, onBackspace: onClose });

  const submitName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== self?.name) {
      setStoredOnlineName(trimmed);
      OnlineClient.send.room.setName(trimmed);
    }
  };

  const close = () => {
    submitName();
    onClose();
  };

  // Picking a color is the whole decision — apply it (along with any name edit) and get out of the
  // way, rather than asking for a second click on Done to confirm what was already chosen.
  const pickColor = (playerNumber: PlayerNumber) => {
    if (playerNumber === self?.playerNumber) return;
    OnlineClient.send.room.setPlayerNumber(playerNumber);
    close();
  };

  const occupants: Partial<Record<PlayerNumber, string>> = {};
  for (const participant of participants) {
    if (participant.id !== self?.id) occupants[participant.playerNumber] ??= participant.name;
  }

  return (
    <Modal open={open} onClose={close}>
      {open && (
        <Menu data-test="online-customize-modal">
          <Menu.Header>Name &amp; color</Menu.Header>
          <Input
            {...register('online-name', () => undefined)}
            label="Your name"
            value={name}
            onChange={setName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') close();
            }}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Enter your name"
            data-test="online-lobby-name-input"
          />
          <PlayerColorPicker
            theme={theme}
            playerNumbers={PLAYER_NUMBERS}
            selected={self?.playerNumber ?? null}
            occupants={occupants}
            onPick={pickColor}
            disableOccupied
            testIdPrefix="online-color"
            occupantTestId="color-occupant"
          />
          <Menu.Button {...register('customize-done', close)} size="small" data-test="customize-done-button">
            Done
          </Menu.Button>
        </Menu>
      )}
    </Modal>
  );
}

export default CustomizeModal;
