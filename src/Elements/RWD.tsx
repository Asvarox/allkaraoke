import styled from '@emotion/styled';
import { desktopMQ, landscapeMQ, mobileMQ } from 'Elements/cssMixins';

export const MobileOnly = styled.div`
  ${desktopMQ} {
    display: none;
  }
`;
export const DesktopOnly = styled.div`
  ${mobileMQ} {
    display: none;
  }
`;
export const LandscapeHidden = styled.div`
  ${landscapeMQ} {
    display: none;
  }
`;
