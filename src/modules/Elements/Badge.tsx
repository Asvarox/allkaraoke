import styled from '@emotion/styled';
import { typography } from '~/modules/Elements/cssMixins';
import styles from '~/modules/GameEngine/Drawing/styles';

export const Badge = styled.span`
  position: absolute;
  transform: translate(40%, -50%);
  top: 0;
  right: 0;
  background: ${styles.colors.text.active};

  font-size: 1.75rem;
  ${typography};
  color: ${styles.colors.text.default};
  padding: 0.25rem 0.75rem;
  border-radius: 1.5rem;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.5);
`;
