import { MenuContainer } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import SelectInputView from '~/routes/select-input/select-input-view';

interface Props {
  onClose: () => void;
  closeButtonText: string;
  open: boolean;
}

export default function SelectInputModal({ onClose, closeButtonText, open }: Props) {
  return (
    <Modal onClose={onClose} open={open}>
      {open && (
        <MenuContainer>
          <SelectInputView
            smooth={false}
            onBack={onClose}
            onFinish={onClose}
            closeButtonText={closeButtonText}
            skipText={'Back'}
          />
        </MenuContainer>
      )}
    </Modal>
  );
}
