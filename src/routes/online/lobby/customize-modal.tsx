import { useEffect, useState } from 'react';
import { MAX_NAME_LENGTH } from '~/consts';
import { Button } from '~/modules/elements/akui/button';
import { Menu } from '~/modules/elements/akui/menu';
import { Input } from '~/modules/elements/input';
import { backgroundTheme } from '~/modules/elements/layout-with-background';
import Modal from '~/modules/elements/modal';
import styles from '~/modules/game-engine/drawing/styles';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import OnlineClient, { ONLINE_NAME_KEY } from '~/modules/online/client/online-client';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import { PLAYER_NUMBERS, PlayerNumber } from '~/modules/players/player-number';
import storage from '~/modules/utils/storage';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/settings/settings-state';

// Same pattern as the remote-mic player change — colors are picked by name, matching the theme
const colorNames: Record<backgroundTheme, string[]> = {
  regular: ['Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Orange'],
  christmas: ['Green', 'Red', 'Blue', 'Gold', 'Violet', 'Silver'],
  eurovision: ['Blue', 'Red', 'Green', 'Pink', 'Violet', 'Orange'],
  halloween: ['Orange', 'Violet', 'Red', 'Green', 'Blue', 'Gold'],
};

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
      storage.setItem(ONLINE_NAME_KEY, trimmed);
      void OnlineClient.rpc.room.setName(trimmed).catch(() => undefined);
    }
  };

  const pickColor = (playerNumber: PlayerNumber) => {
    if (playerNumber === self?.playerNumber) return;
    void OnlineClient.rpc.room.setPlayerNumber(playerNumber).catch(() => undefined);
  };

  const close = () => {
    submitName();
    onClose();
  };

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
          <div className="flex flex-col gap-2 pb-2">
            {PLAYER_NUMBERS.map((number) => {
              const occupant = participants.find(
                (participant) => participant.playerNumber === number && participant.id !== self?.id,
              );
              const isOwn = self?.playerNumber === number;

              return (
                <Button
                  key={number}
                  size="small"
                  data-test={`online-color-${number}`}
                  data-selected={isOwn}
                  data-focused={isOwn}
                  onClick={isOwn ? undefined : () => pickColor(number)}
                  disabled={!!occupant}
                  className="gap-2"
                  style={{ color: styles.colors.players[number].perfect.fill }}>
                  {colorNames[theme][number]}
                  {(isOwn || occupant) && (
                    <span className="text-sm text-gray-300" data-test="color-occupant">
                      ({isOwn ? 'You' : occupant?.name})
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <Menu.Button {...register('customize-done', close)} size="small" data-test="customize-done-button">
            Done
          </Menu.Button>
        </Menu>
      )}
    </Modal>
  );
}

export default CustomizeModal;
