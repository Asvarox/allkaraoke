import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { useState } from 'react';
import { useEventEffect } from 'Scenes/Game/Singing/Hooks/useEventListener';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { focused } from 'Elements/cssMixins';

interface Props {
    onConfirm: () => void;
}

function ConfirmReadiness({ onConfirm }: Props) {
    const [visible, setVisible] = useState(false);

    useEventEffect(events.remoteReadinessRequested, () => {
        setVisible(true);
    });
    const confirm = () => {
        WebRTCClient.confirmReadiness();
        setVisible(false);
        onConfirm();
    };

    return visible ? (
        <Form>
            <MenuContainer>
                <ReadyButton data-test="ready-button" onClick={confirm}>
                    Ready
                </ReadyButton>
            </MenuContainer>
        </Form>
    ) : null;
}
export default ConfirmReadiness;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    z-index: 1000;
`;

const ReadyButton = styled(MenuButton)`
    aspect-ratio: 1;

    ${focused};
`;
