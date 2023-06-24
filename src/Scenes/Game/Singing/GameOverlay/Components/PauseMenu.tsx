import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useEffect, useRef, useState } from 'react';
import SelectInputModal from 'Scenes/SelectInput/SelectInputModal';

interface Props {
    onResume: () => void;
    onExit: () => void;
    onRestart: () => void;
}

export default function PauseMenu({ onResume, onExit, onRestart }: Props) {
    const menuRef = useRef<null | HTMLButtonElement>(null);

    useEffect(() => {
        menuRef.current?.focus();
    }, [menuRef]);

    const [isInputModalOpen, setIsInputModalOpen] = useState(false);

    const { register } = useKeyboardNav({ enabled: !isInputModalOpen });

    return (
        <Container>
            <MenuContainer>
                <MenuButton {...register('resume', onResume)} ref={menuRef} data-test="button-resume-song">
                    Resume song
                </MenuButton>
                <MenuButton {...register('restart', onRestart)} data-test="button-restart-song">
                    Restart song
                </MenuButton>
                <MenuButton {...register('exit', onExit)} data-test="button-exit-song">
                    Exit song
                </MenuButton>
                <MenuButton {...register('input-settings', () => setIsInputModalOpen(true))} data-test="input-settings">
                    Microphones settings
                </MenuButton>
            </MenuContainer>
            {isInputModalOpen && (
                <SelectInputModal
                    onClose={() => setIsInputModalOpen(false)}
                    playerNames={[]}
                    closeButtonText={'Back to Pause Menu'}
                />
            )}
        </Container>
    );
}

const Container = styled.div`
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;

    align-items: center;
    justify-content: center;
`;
