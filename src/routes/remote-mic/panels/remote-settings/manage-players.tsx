import { useState } from 'react';
import { twc } from 'react-twc';
import { ValuesType } from 'utility-types';

import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import Typography from '~/modules/elements/akui/primitives/typography';
import { MenuButton } from '~/modules/elements/menu';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';
import { SubscriptionChannels } from '~/modules/remote-mic/network/client/subscriptions';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import PlayerChangeModal from '~/routes/remote-mic/components/player-change-modal';
import PlayerNumberCircle from '~/routes/remote-mic/components/player-number-circle';

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
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          <>
            Change <strong className="ph-no-capture">{mic.name}</strong>
          </>
        }>
        {permission === 'write' && (
          <PlayerChangeModal
            showRemoveButton={true}
            id={mic.id}
            playerNumber={mic.number}
            onModalClose={() => setOpen(false)}
          />
        )}
      </BottomSheet>
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
