import styled from '@emotion/styled';
import { landscapeMQ } from 'modules/Elements/cssMixins';

export const MobileOnly = styled.div`
  color: blue;
  @media (hover: hover) {
    display: none;
  }
`;
export const DesktopOnly = styled.div`
  @media (hover: none) {
    display: none;
  }
`;
export const LandscapeHidden = styled.div`
  ${landscapeMQ} {
    display: none;
  }
`;
