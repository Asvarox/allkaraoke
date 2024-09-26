import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  onClose?: () => void;
}

export default function Modal({ children, onClose }: Props) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div onClick={onClose} className="fixed top-0 left-0 w-screen h-screen z-[20001] overflow-auto">
        <div className="flex items-center justify-center min-h-full">
          <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
      </div>
    </>
  );
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  width: 100vw;
  height: 100vh;
  z-index: 20000;
  backdrop-filter: blur(20px);
`;
