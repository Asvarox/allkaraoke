import { MenuContainer } from 'Elements/Menu';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import Modal from 'Elements/Modal';
import GameState from 'Scenes/Game/Singing/GameState/GameState';

interface Props {
    onClose: () => void;
    playerNames?: string[];
    closeButtonText: string;
}

export default function SelectInputModal({ onClose, playerNames, closeButtonText }: Props) {
    const names = playerNames || GameState.getPlayers().map((player) => player.getName());

    return (
        <Modal onClose={onClose}>
            <MenuContainer>
                <SelectInputView
                    onBack={onClose}
                    onFinish={onClose}
                    closeButtonText={closeButtonText}
                    skipText={'Back'}
                    playerNames={names}
                />
            </MenuContainer>
        </Modal>
    );
}
