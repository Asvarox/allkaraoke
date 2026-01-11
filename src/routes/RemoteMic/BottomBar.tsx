import { List as ListIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { MicIcon } from 'modules/Elements/MicIcon';
import { twc, TwcComponentProps } from 'react-twc';
import { PhoneTabs } from 'routes/RemoteMic/RemoteMic';

interface Props {
  active: PhoneTabs;
  setActiveTab: (active: PhoneTabs) => void;
}

export default function BottomBar({ active, setActiveTab }: Props) {
  return (
    <div className="landscap:fixed landscap:max-w-[400px] landscap:scale-75 right-0 bottom-0 flex w-full origin-bottom-right items-stretch gap-[1px]">
      <ItemContainer
        $active={active === 'microphone'}
        onClick={() => setActiveTab('microphone')}
        data-test="menu-microphone">
        <ItemIcon>
          <MicIcon />
        </ItemIcon>
        <ItemTitle>Microphone</ItemTitle>
      </ItemContainer>
      <ItemContainer
        $active={active === 'song-list'}
        onClick={() => setActiveTab('song-list')}
        data-test="menu-song-list">
        <ItemIcon>
          <ListIcon />
        </ItemIcon>
        <ItemTitle>Song list</ItemTitle>
      </ItemContainer>
      <ItemContainer $active={active === 'settings'} onClick={() => setActiveTab('settings')} data-test="menu-settings">
        <ItemIcon>
          <SettingsIcon />
        </ItemIcon>
        <ItemTitle>Settings</ItemTitle>
      </ItemContainer>
    </div>
  );
}

const ItemContainer = twc.div<{ $active?: boolean } & TwcComponentProps<'div'>>((props) =>
  [
    'flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 bg-black p-2.5 text-sm',
    props.$active ? 'text-active' : 'text-[#cecece]',
  ].join(' '),
);

const ItemIcon = twc.div`text-sm [&_svg]:h-6 [&_svg]:w-6`;
const ItemTitle = twc.div``;
