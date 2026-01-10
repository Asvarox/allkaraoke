import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { MenuButton } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { NetworkRemoteMicListMessage } from 'modules/RemoteMic/Network/messages';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useEffect, useState } from 'react';
import { twc } from 'react-twc';
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
      <span className="typography text-lg">Manage Players</span>
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
        <div
          className={`ph-no-capture truncate ${mic.id === RemoteMicClient.getClientId() ? 'text-active' : 'text-inherit'}`}>
          {mic.name}
        </div>
      </RemoteMicEntry>
    </Container>
  );
};

const Container = twc.div`flex flex-col gap-2.5`;

const RemoteMicEntry = twc(MenuButton)`flex items-center px-5`;

const RemoteMicId = twc.span`text-sm px-2.5`;
export default ManagePlayers;
