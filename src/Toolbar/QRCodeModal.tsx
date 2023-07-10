import { Button } from 'Elements/Button';
import { MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import 'RemoteMic/eventListeners';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import 'Stats';
import useKeyboardNav from 'hooks/useKeyboardNav';

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
