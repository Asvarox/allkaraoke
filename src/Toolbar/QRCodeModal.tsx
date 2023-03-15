import 'Stats';
import 'RemoteMic/eventListeners';
import Modal from 'Elements/Modal';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import { MenuContainer } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Button } from 'Elements/Button';

interface Props {
    closeModal: () => void;
}
function QRCodeModal({ closeModal }: Props) {
    const { register } = useKeyboardNav({
        onBackspace: closeModal,
    });

    return (
        <Modal onClose={closeModal}>
            <MenuContainer>
                <ConnectRemoteMic />
                <Button {...register('close', closeModal)}>Close</Button>
            </MenuContainer>
        </Modal>
    );
}

export default QRCodeModal;
