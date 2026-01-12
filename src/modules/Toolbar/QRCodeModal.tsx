import { Menu } from '~/modules/Elements/AKUI/Menu';
import Modal from '~/modules/Elements/Modal';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import '~/modules/RemoteMic/eventListeners';
import '~/modules/Stats';
import ConnectRemoteMic from '~/routes/ConnectRemoteMic/ConnectRemoteMic';

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
      <Menu>
        <ConnectRemoteMic />
        <Menu.Button {...register('quick-connect-close', closeModal)} size="small">
          Close
        </Menu.Button>
      </Menu>
    </Modal>
  );
}

export default QRCodeModal;
