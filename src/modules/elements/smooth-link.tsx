import { AnchorHTMLAttributes, MouseEventHandler, ReactElement } from 'react';
import { Link } from 'wouter';

import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';

interface BaseProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}

// Mirrors wouter's Link: renders an <a>, or with `asChild` passes the link props to its only child
type Props = (BaseProps & { asChild?: false }) | (BaseProps & { asChild: true; children: ReactElement });

export default function SmoothLink({ asChild, ...props }: Props) {
  const navigate = useSmoothNavigate();
  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (!props.onClick) {
      e.preventDefault();
      navigate(props.to);
    } else {
      props.onClick(e);
    }
  };

  return asChild ? (
    <Link {...props} asChild onClick={handleClick}>
      {props.children as ReactElement}
    </Link>
  ) : (
    <Link {...props} onClick={handleClick} />
  );
}
