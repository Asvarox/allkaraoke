import styled from '@emotion/styled';
import { Animated } from 'remotion-animated';

export const SAnimated = styled(Animated)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

export const CenterAbsoluteFill = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
  flex-direction: column;
`;
