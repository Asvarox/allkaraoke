import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import '~/modules/remote-mic/event-listeners';
import '~/modules/stats/index';
import ConnectRemoteMic from '~/routes/connect-remote-mic/connect-remote-mic';

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
