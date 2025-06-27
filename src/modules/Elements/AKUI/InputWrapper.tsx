import { ReactNode } from 'react';
import Typography from './Primitives/Typography';

export const InputWrapper = (props: React.PropsWithChildren<{ info?: ReactNode }>) => {
  const { info, children } = props;

  if (!info) {
    return children;
  }

  return (
    <div className="flex flex-col gap-2">
      {children}
      <Typography className="pl-2 text-sm leading-8">{info}</Typography>
    </div>
  );
};
