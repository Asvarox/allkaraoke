import styled from '@emotion/styled';
import MuiTooltip from '@mui/material/Tooltip';
import { typography } from 'Elements/cssMixins';
import { ComponentProps } from 'react';

const ToBeStyledTooltip = ({ className, ...props }: ComponentProps<typeof MuiTooltip>) => (
  <MuiTooltip arrow {...props} classes={{ tooltip: className }} />
);

export const Tooltip = styled(ToBeStyledTooltip)`
  background: rgba(0, 0, 0, 0.85);
  font-size: 2rem;
  padding: 1rem;
  border-radius: 1rem;
  ${typography};
  .MuiTooltip-arrow {
    &::before {
      background: rgba(0, 0, 0, 0.85);
    }
  }
`;
