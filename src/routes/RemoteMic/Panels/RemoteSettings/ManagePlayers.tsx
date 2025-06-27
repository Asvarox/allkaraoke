import styled from '@emotion/styled';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { MenuButton } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import styles from 'modules/GameEngine/Drawing/styles';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { NetworkRemoteMicListMessage } from 'modules/RemoteMic/Network/messages';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useEffect, useState } from 'react';
import PlayerChangeModal from 'routes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from 'routes/RemoteMic/Components/PlayerNumberCircle';
import { ValuesType } from 'utility-types';

function ManagePlayers() {
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
      {list.length === 0 && <Typography className="text-sm">No remote microphones connected</Typography>}
    </>
  );
}

const Entry = ({ mic }: { mic: ValuesType<NetworkRemoteMicListMessage['list']> }) => {
  const [open, setOpen] = useState(false);
  const permission = RemoteMicManager.getPermission(mic.id);

  return (
    <Container data-test="manage-players">
      <Modal open={open} onClose={() => setOpen(false)}>
        {permission === 'write' && open && (
          <PlayerChangeModal
            showRemoveButton={true}
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
      </Modal>
      <RemoteMicEntry
        onClick={() => setOpen(true)}
        data-test="remote-mic-entry"
        data-id={mic.id ?? mic.name}
        size="small">
        <PlayerNumberCircle number={mic.number} />
        <RemoteMicId>{mic.id?.slice(-4) ?? '????'}</RemoteMicId>
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
  color: ${(props) => (props.isSelf ? `${styles.colors.text.active}` : 'auto')};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
const RemoteMicId = styled.span`
  font-size: 1.5rem;
  padding: 0 1rem;
`;
export default ManagePlayers;
