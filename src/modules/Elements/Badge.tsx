import { styled } from '@linaria/react';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';

export const Badge = styled.span`
  position: absolute;
  transform: translate(40%, -50%);
  top: 0;
  right: 0;
  background: ${styles.colors.text.active};

  font-size: 1.5rem;
  ${typography};
  color: ${styles.colors.text.default};
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
`;
