import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { ComponentProps, HTMLAttributes, MouseEventHandler } from 'react';
import { Link } from 'wouter';

interface Props extends Omit<ComponentProps<typeof Link>, 'href' | 'to'> {
  to: string;
  disabled?: boolean;
  onClick?: HTMLAttributes<HTMLElement>['onClick'];
}

export default function SmoothLink(props: Props) {
  const navigate = useSmoothNavigate();
  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (!props.onClick) {
      e.preventDefault();
      navigate(props.to);
    } else {
      props.onClick(e);
    }
  };

  return <Link {...props} onClick={handleClick} />;
}
