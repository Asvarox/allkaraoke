import { GameScreens } from 'modules/Elements/GameScreens';
import Toolbar from 'modules/Toolbar/Toolbar';
import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  toolbar?: boolean;
  toolbarContent?: React.ReactNode;
}

function LayoutGame({ children, toolbarContent, toolbar = true }: Props) {
  return (
    <GameScreens>
      {toolbar && <Toolbar>{toolbarContent}</Toolbar>}
      {children}
    </GameScreens>
  );
}

export default LayoutGame;
