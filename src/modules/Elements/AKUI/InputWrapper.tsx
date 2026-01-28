import { ReactNode } from 'react';
import Typography from './Primitives/Typography';

export const InputWrapper = (props: React.PropsWithChildren<{ info?: ReactNode }>) => {
  const { info, children } = props;

  if (!info) {
    return children;
  }

  return (
    <div className="flex flex-col">
      {children}
      <Typography className="pl-2 text-sm leading-6">{info}</Typography>
    </div>
  );
};
