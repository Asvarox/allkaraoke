import { PropsWithChildren } from 'react';

import Toolbar from '~/modules/toolbar/toolbar';

interface Props extends PropsWithChildren {
  toolbar?: boolean;
  toolbarContent?: React.ReactNode;
  /** Off where a phone can't join as a mic, e.g. online mode — every singer brings their own device */
  connectPhone?: boolean;
}

function LayoutGame({ children, toolbarContent, toolbar = true, connectPhone = true }: Props) {
  return (
    <>
      {toolbar && <Toolbar connectPhone={connectPhone}>{toolbarContent}</Toolbar>}
      {children}
    </>
  );
}

export default LayoutGame;
