import { useState } from 'react';
import { twc } from 'react-twc';
import { ValuesType } from 'utility-types';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import { MenuButton } from '~/modules/Elements/Menu';
import Modal from '~/modules/Elements/Modal';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { useSubscription } from '~/modules/RemoteMic/Network/Client/hooks/useSubscription';
import { SubscriptionChannels } from '~/modules/RemoteMic/Network/Client/subscriptions';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import PlayerChangeModal from '~/routes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from '~/routes/RemoteMic/Components/PlayerNumberCircle';

function ManagePlayers() {
  const list = useSubscription('remote-mics') ?? [];

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

const Entry = ({ mic }: { mic: ValuesType<SubscriptionChannels['remote-mics']> }) => {
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

const RemoteMicId = twc.span`px-2.5 text-sm`;
export default ManagePlayers;
