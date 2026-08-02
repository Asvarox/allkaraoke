import { type CSSProperties, PropsWithChildren, useContext, useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
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
        className="fixed top-0 right-0 z-[10000] m-0 flex cursor-pointer items-center gap-1 pt-2 pr-2 text-white"
        style={toolbarStyle}>
        {children}
        {hasContent && (
          <Tooltip title="Toggle help" place="bottom-end">
            <Button
              size={{ xs: 'mini', sm: 'small' }}
              type="button"
              className="hidden md:flex"
              aria-label="Toggle help"
              onClick={() => setIsHelpVisible(!isHelpVisible)}
              data-test="toggle-help"
              leftIcon={<Icon icon={isHelpVisible ? 'ic:baseline-help' : 'ic:outline-help'} />}
            />
          </Tooltip>
        )}
        <FullscreenButton size={{ xs: 'mini', sm: 'small' }} />
        <Tooltip title="Connect phone" place="bottom-end">
          <Button
            size={{ xs: 'mini', sm: 'small' }}
            type="button"
            aria-label="Connect phone"
            onClick={() => setIsModalOpen((current) => !current)}
            leftIcon={<Icon icon="ic:baseline-qr-code-2" />}
            data-test="quick-connect-phone"
          />
        </Tooltip>
      </div>
    </>
  );
}

export default Toolbar;
