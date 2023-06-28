import { MenuContainer } from 'Elements/Menu';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import Modal from 'Elements/Modal';

interface Props {
    onClose: () => void;
    closeButtonText: string;
}

export default function SelectInputModal({ onClose, closeButtonText }: Props) {
    return (
        <Modal onClose={onClose}>
            <MenuContainer>
                <SelectInputView
                    onBack={onClose}
                    onFinish={onClose}
                    closeButtonText={closeButtonText}
                    skipText={'Back'}
                />
            </MenuContainer>
        </Modal>
    );
}
