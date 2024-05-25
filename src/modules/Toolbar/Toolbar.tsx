import styled from '@emotion/styled';
import { Help, HelpOutline, QrCode2 } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Tooltip } from 'modules/Elements/Tooltip';
import 'modules/RemoteMic/eventListeners';
import 'modules/Stats';
import FullscreenButton from 'modules/Toolbar/Fullscreen';
import QRCodeModal from 'modules/Toolbar/QRCodeModal';
import { useContext, useState } from 'react';
import { KeyboardHelpContext } from 'routes/KeyboardHelp/Context';
import { KeyboardHelpVisibilitySetting, MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

function Toolbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [isHelpVisible, setIsHelpVisible] = useSettingValue(KeyboardHelpVisibilitySetting);
  const { hasContent } = useContext(KeyboardHelpContext);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {isModalOpen && <QRCodeModal closeModal={closeModal} />}
      <ToolbarContainer>
        {hasContent && (
          <Tooltip title="Toggle help">
            <HelpButton size="small" onClick={() => setIsHelpVisible(!isHelpVisible)} data-test="toggle-help">
              {isHelpVisible ? <Help /> : <HelpOutline />}
            </HelpButton>
          </Tooltip>
        )}
        <FullscreenButton />
        <Tooltip title="Connect phone">
          <IconButton
            size="small"
            onClick={() => setIsModalOpen((current) => !current)}
            data-test="quick-connect-phone">
            <QrCode2 />
          </IconButton>
        </Tooltip>
        {/*<Tooltip title="Toggle Mobile Phone Mode">*/}
        {/*    <IconButton*/}
        {/*        size="small"*/}
        {/*        onClick={async () => {*/}
        {/*            try {*/}
        {/*                setMobilePhoneMode(!mobilePhoneMode);*/}
        {/*                await document.body.requestFullscreen();*/}
        {/*                global.screen.orientation.unlock();*/}
        {/*                await global.screen.orientation.lock?.('landscape');*/}
        {/*            } catch (e) {*/}
        {/*                console.info(e);*/}
        {/*            }*/}
        {/*        }}>*/}
        {/*        {mobilePhoneMode ? <Laptop /> : <PhoneIphone />}*/}
        {/*    </IconButton>*/}
        {/*</Tooltip>*/}
      </ToolbarContainer>
    </>
  );
}

const ToolbarContainer = styled.div`
  view-transition-name: toolbar;

  cursor: pointer;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.2rem;
  padding-left: 1rem;
  margin: 0;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  color: white;

  svg {
    fill: white;
    width: 3.5rem;
    height: 3.5rem;
    transition: transform 200ms;

    &:hover {
      transform: scale(1.2);
    }
  }

  display: flex;
  gap: 0.75rem;
  border-bottom-left-radius: 1.5rem;
`;

const HelpButton = styled(IconButton)`
  scale: 0.9;
`;

export default Toolbar;
