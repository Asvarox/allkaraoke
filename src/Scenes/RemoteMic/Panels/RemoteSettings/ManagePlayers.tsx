import styled from '@emotion/styled';
import { MenuButton } from 'Elements/Menu';
import events from 'GameEvents/GameEvents';
import { useEventListener } from 'GameEvents/hooks';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { WebRTCRemoteMicListEvent } from 'RemoteMic/Network/events';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import PlayerChangeModal from 'Scenes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from 'Scenes/RemoteMic/Components/PlayerNumberCircle';
import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';

interface Props {}

function ManagePlayers(props: Props) {
    useEffect(() => {
        RemoteMicClient.subscribe('remote-mics');

        return () => {
            RemoteMicClient.unsubscribe('remote-mics');
        };
    }, []);

    const [list] = useEventListener(events.remoteMicListUpdated) ?? [[]];

    return (
        <>
            <h3>Manage Players</h3>
            {list.map((mic) => (
                <Entry mic={mic} key={mic.id} />
            ))}
            {list.length === 0 && <h4>No remote microphones connected</h4>}
        </>
    );
}

const Entry = ({ mic }: { mic: ValuesType<WebRTCRemoteMicListEvent['list']> }) => {
    const [open, setOpen] = useState(false);
    const permission = RemoteMicManager.getPermission(mic.id);
    return (
        <Container data-test="manage-players">
            {open && (
                <PlayerChangeModal
                    id={mic.id}
                    playerNumber={mic.number}
                    onModalClose={() => setOpen(false)}
                    header={
                        <>
                            Change <strong className="ph-no-capture">{mic.name}</strong>:
                        </>
                    }
                />
            )}
            <RemoteMicEntry
                onClick={() => setOpen(true)}
                data-test="remote-mic-entry"
                data-id={mic.id}
                value={permission}
                size="small">
                <PlayerNumberCircle number={mic.number} />
                <RemoteMicId>{mic.id.slice(-4)}</RemoteMicId>
                <RemoteMicName className="ph-no-capture" isSelf={mic.id === RemoteMicClient.getClientId()}>
                    {mic.name}
                </RemoteMicName>
            </RemoteMicEntry>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const RemoteMicEntry = styled(MenuButton)`
    display: flex;
    align-items: center;
    padding: 0 2rem;
`;

const RemoteMicName = styled.div<{ isSelf: boolean }>`
    ${(props) => props.isSelf && `color: ${styles.colors.text.active};`}
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;
const RemoteMicId = styled.span`
    font-size: 1.5rem;
    padding: 0 1rem;
`;
export default ManagePlayers;
