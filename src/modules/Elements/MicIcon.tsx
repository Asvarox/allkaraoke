import styled from '@emotion/styled';
import styles from 'modules/GameEngine/Drawing/styles';
import { SVGProps } from 'react';

export const MicIcon = ({ ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 512 512" fill="currentcolor" {...props}>
    <path
      stroke="black"
      strokeWidth="2%"
      xmlns="http://www.w3.org/2000/svg"
      d="M252.529,162.029l168.125,210.156c-12.313,1.25-24.031,6.438-33.031,15.438s-14.188,20.719-15.438,33.031L162.029,252.545  c-3.563-24.922,4.813-50.078,22.625-67.891C202.467,166.857,227.623,158.467,252.529,162.029z M398.936,398.936  c-9.063,9.063-13.031,22.063-10.625,34.656l45.281,45.25c12.5,12.5,32.75,12.5,45.25,0s12.5-32.75,0-45.25l-45.25-45.281  C420.998,385.904,407.998,389.873,398.936,398.936z M162.029,162.029c18.594-18.594,43.188-29.891,68.969-32.297  c-3.375-24.563-14.906-49.391-35.031-69.516c-43.75-43.75-109.594-48.813-147.063-11.313  c-37.5,37.484-32.438,103.328,11.313,147.078c20.125,20.125,44.938,31.656,69.5,35.031  C132.154,205.217,143.436,180.623,162.029,162.029z"
    />
  </svg>
);

export const MicIconRed = styled(MicIcon)`
  fill: ${styles.colors.players[1].text};
`;
export const MicIconBlue = styled(MicIcon)`
  fill: ${styles.colors.players[0].text};
`;
