import clsx from 'clsx';
import { ComponentProps } from 'react';

export default function Loader({ className, ...props }: ComponentProps<'svg'> & { size?: string }) {
  return (
    <svg
      version="1.1"
      id="L9"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="25 25 50 50"
      enableBackground="new 0 0 0 0"
      width={props.size ?? '1em'}
      height={props.size ?? '1em'}
      className={clsx('text-text-player-0', className)}
      {...props}>
      <path
        fill="currentColor"
        d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="1s"
          from="0 50 50"
          to="360 50 50"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
