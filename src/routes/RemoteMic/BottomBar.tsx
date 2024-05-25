import styled from '@emotion/styled';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import { MicIcon } from 'modules/Elements/MicIcon';
import styles from 'modules/GameEngine/Drawing/styles';
import { PhoneTabs } from 'routes/RemoteMic/RemoteMic';

interface Props {
  active: PhoneTabs;
  setActiveTab: (active: PhoneTabs) => void;
}

export default function BottomBar({ active, setActiveTab }: Props) {
  return (
    <Container>
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
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: stretch;
  width: 100%;
  gap: 1px;
  background: #424242;

  @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
    max-width: 400px;
    transform: scale(0.75);
    transform-origin: bottom right;
  }
`;

const ItemContainer = styled.div<{ active?: boolean }>`
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
