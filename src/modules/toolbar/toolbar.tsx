import { Help, HelpOutlined, QrCode2 } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { type CSSProperties, PropsWithChildren, useContext, useState } from 'react';
import { Tooltip } from '~/modules/elements/tooltip';
import FullscreenButton from '~/modules/toolbar/fullscreen';
import QRCodeModal from '~/modules/toolbar/qr-code-modal';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';
import { KeyboardHelpVisibilitySetting, useSettingValue } from '~/routes/settings/settings-state';

type ViewTransitionStyle = CSSProperties & {
  viewTransitionName?: string;
};

const toolbarStyle: ViewTransitionStyle = {
  viewTransitionName: 'toolbar',
};

function Toolbar({ children }: PropsWithChildren) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useSettingValue(KeyboardHelpVisibilitySetting);
  const { hasContent } = useContext(KeyboardHelpContext);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <QRCodeModal closeModal={closeModal} open={isModalOpen} />
      <div
        className="fixed top-0 right-0 z-[10000] m-0 flex cursor-pointer items-center gap-2 rounded-bl-2xl bg-black/75 pl-2.5 text-white [&_svg]:h-8 [&_svg]:w-8 [&_svg]:fill-current [&_svg]:transition-transform [&_svg]:duration-200 [&_svg:hover]:scale-125"
        style={toolbarStyle}>
        {children}
        {hasContent && (
          <Tooltip title="Toggle help" place="bottom-end">
            <IconButton
              className="hidden! scale-90 text-white md:block!"
              size="small"
              onClick={() => setIsHelpVisible(!isHelpVisible)}
              data-test="toggle-help">
              {isHelpVisible ? <Help className="fill-white!" /> : <HelpOutlined className="fill-white!" />}
            </IconButton>
          </Tooltip>
        )}
        <FullscreenButton />
        <Tooltip title="Connect phone" place="bottom-end">
          <IconButton
            size="small"
            onClick={() => setIsModalOpen((current) => !current)}
            data-test="quick-connect-phone">
            <QrCode2 className="fill-white!" />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
}

export default Toolbar;
