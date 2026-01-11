import { MenuContainer } from '~/modules/Elements/Menu';
import Modal from '~/modules/Elements/Modal';
import SelectInputView from '~/routes/SelectInput/SelectInputView';

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
