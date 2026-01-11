import styled from '@emotion/styled';
import { List as ListIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { MicIcon } from '~/modules/Elements/MicIcon';
import styles from '~/modules/GameEngine/Drawing/styles';
import { PhoneTabs } from '~/routes/RemoteMic/RemoteMic';

interface Props {
  active: PhoneTabs;
  setActiveTab: (active: PhoneTabs) => void;
}

export default function BottomBar({ active, setActiveTab }: Props) {
  return (
    <div className="landscap:fixed landscap:max-w-[400px] landscap:scale-75 right-0 bottom-0 flex w-full origin-bottom-right items-stretch gap-[1px]">
      <ItemContainer
        active={active === 'microphone'}
        onClick={() => setActiveTab('microphone')}
        data-test="menu-microphone">
        <ItemIcon>
          <MicIcon />
        </ItemIcon>
        <ItemTitle>Microphone</ItemTitle>
      </ItemContainer>
      <ItemContainer
        active={active === 'song-list'}
        onClick={() => setActiveTab('song-list')}
        data-test="menu-song-list">
        <ItemIcon>
          <ListIcon />
        </ItemIcon>
        <ItemTitle>Song list</ItemTitle>
      </ItemContainer>
      <ItemContainer active={active === 'settings'} onClick={() => setActiveTab('settings')} data-test="menu-settings">
        <ItemIcon>
          <SettingsIcon />
        </ItemIcon>
        <ItemTitle>Settings</ItemTitle>
      </ItemContainer>
    </div>
  );
}

const ItemContainer = styled.div<{ active?: boolean }>`
  cursor: pointer;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: black;
  padding: 1rem;
  font-size: 1.5rem;
  gap: 0.5rem;
  color: ${(props) => (props.active ? styles.colors.text.active : '#cecece')};
`;

const ItemIcon = styled.div`
  svg {
    width: 2.5rem;
    height: 2.5rem;
  }
  font-size: 2rem;
`;
const ItemTitle = styled.div``;
