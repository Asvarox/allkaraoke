import { PropsWithChildren } from 'react';
import Toolbar from '~/modules/Toolbar/Toolbar';

interface Props extends PropsWithChildren {
  toolbar?: boolean;
  toolbarContent?: React.ReactNode;
}

function LayoutGame({ children, toolbarContent, toolbar = true }: Props) {
  return (
    <>
      {toolbar && <Toolbar>{toolbarContent}</Toolbar>}
      {children}
    </>
  );
}

export default LayoutGame;
