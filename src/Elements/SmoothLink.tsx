import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { ComponentProps, MouseEventHandler } from 'react';
import { Link } from 'wouter';

interface Props extends Omit<ComponentProps<typeof Link>, 'href' | 'to'> {
  to: string;
}

export default function SmoothLink(props: Props) {
  const navigate = useSmoothNavigate();
  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    navigate(props.to);
  };

  return <Link {...props} onClick={handleClick} />;
}
