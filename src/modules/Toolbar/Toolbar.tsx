import styled from '@emotion/styled';
import { Help, HelpOutline, QrCode2 } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { PropsWithChildren, useContext, useState } from 'react';
import { Tooltip } from '~/modules/Elements/Tooltip';
import FullscreenButton from '~/modules/Toolbar/Fullscreen';
import QRCodeModal from '~/modules/Toolbar/QRCodeModal';
import { KeyboardHelpContext } from '~/routes/KeyboardHelp/KeyboardHelpContext';
import { KeyboardHelpVisibilitySetting, useSettingValue } from '~/routes/Settings/SettingsState';

function Toolbar({ children }: PropsWithChildren) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [isHelpVisible, setIsHelpVisible] = useSettingValue(KeyboardHelpVisibilitySetting);
  const { hasContent } = useContext(KeyboardHelpContext);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <QRCodeModal closeModal={closeModal} open={isModalOpen} />
      <ToolbarContainer className="flex items-center">
        {children}
        {hasContent && (
          <Tooltip title="Toggle help" place="bottom-end">
            <HelpButton size="small" onClick={() => setIsHelpVisible(!isHelpVisible)} data-test="toggle-help">
              {isHelpVisible ? <Help /> : <HelpOutline />}
            </HelpButton>
          </Tooltip>
        )}
        <FullscreenButton />
        <Tooltip title="Connect phone" place="bottom-end">
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
  //padding: 0.1rem;
  padding-left: 1rem;
  margin: 0;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  color: white;

  svg {
    fill: white;
    width: 3.25rem;
    height: 3.25rem;
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
