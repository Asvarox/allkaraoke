import { ValuesType } from 'utility-types';

import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';
import { MenuContainer } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import SelectInputView from '~/routes/select-input/select-input-view';
import { MicSetupPreference } from '~/routes/settings/settings-state';

interface Props {
  onClose: () => void;
  /** Called instead of `onClose` once the setup is saved. `skip` means the user backed out without picking one. */
  onFinish?: (pref: ValuesType<typeof MicSetupPreference>) => void;
  closeButtonText: string;
  open: boolean;
}

export default function SelectInputModal({ onClose, onFinish, closeButtonText, open }: Props) {
  return (
    <Modal onClose={onClose} open={open}>
      {open && (
        // Capped at the viewport and scrolled internally: the device lists some of these steps show
        // are as long as the hardware plugged in, and past the cap the dialog would otherwise grow
        // off both ends of the screen. Its parts keep their size and the dialog scrolls instead, and on a
        // full-screen phone the buttons sit at the bottom.
        <MenuContainer modal className="max-h-[85dvh] justify-start">
          <ScrollableColumn className="w-full flex-1" contentClassName="gap-4 *:shrink-0">
            <SelectInputView
              smooth={false}
              onBack={onClose}
              onFinish={onFinish ?? onClose}
              closeButtonText={closeButtonText}
              skipText={'Back'}
            />
          </ScrollableColumn>
        </MenuContainer>
      )}
    </Modal>
  );
}
