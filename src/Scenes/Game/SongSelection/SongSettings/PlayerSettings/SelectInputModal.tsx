import { MenuContainer } from 'Elements/Menu';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import Modal from 'Elements/Modal';

interface Props {
    onClose: () => void;
    playerNames: string[];
    required: boolean;
}

export default function SelectInputModal({ onClose, playerNames, required }: Props) {
    return (
        <Modal onClose={onClose}>
            <MenuContainer>
                <SelectInputView
                    onFinish={onClose}
                    closeButtonText={required ? 'Continue to the song' : 'Back to player setup'}
                    playerNames={playerNames}
                />
            </MenuContainer>
        </Modal>
    );
}
