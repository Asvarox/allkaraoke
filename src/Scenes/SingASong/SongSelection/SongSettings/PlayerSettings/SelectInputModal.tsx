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
                    onBack={onClose}
                    onFinish={onClose}
                    closeButtonText={required ? 'Continue to the song' : 'Continue to player setup'}
                    skipText={'Back'}
                    playerNames={playerNames}
                />
            </MenuContainer>
        </Modal>
    );
}
