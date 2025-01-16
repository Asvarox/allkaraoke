import { Button } from 'modules/Elements/Button';
import { MenuContainer } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import 'modules/RemoteMic/eventListeners';
import 'modules/Stats';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import ConnectRemoteMic from 'routes/ConnectRemoteMic/ConnectRemoteMic';

interface Props {
  open: boolean;
  closeModal: () => void;
}
function QRCodeModal({ closeModal, open }: Props) {
  const { register } = useKeyboardNav({
    onBackspace: closeModal,
  });

  return (
    <Modal onClose={closeModal} open={open}>
      <MenuContainer>
        <ConnectRemoteMic />
        <Button {...register('quick-connect-close', closeModal)}>Close</Button>
      </MenuContainer>
    </Modal>
  );
}

export default QRCodeModal;
