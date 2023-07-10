import { MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';

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
