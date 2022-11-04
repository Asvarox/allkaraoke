import styled from '@emotion/styled';
import { MenuContainer } from 'Elements/Menu';
import SelectInputContent from 'Scenes/SelectInput/SelectInputContent';

interface Props {
    onClose: () => void;
    playerNames: string[];
}

export default function SelectInputModal({ onClose, playerNames }: Props) {
    return (
        <>
            <Backdrop onClick={onClose} />
            <Container onClick={onClose}>
                <MenuContainer onClick={(e) => e.stopPropagation()}>
                    <SelectInputContent
                        onClose={onClose}
                        closeButtonText="Back to player setup"
                        playerNames={playerNames}
                    />
                </MenuContainer>
            </Container>
        </>
    );
}

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100vw;
    height: 100vh;
    z-index: 2;
    backdrop-filter: blur(20px);
`;
