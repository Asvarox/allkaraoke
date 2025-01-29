import CircularProgress from '@mui/material/CircularProgress';
import { ComponentProps } from 'react';

export default function Loader(props: ComponentProps<typeof CircularProgress>) {
  return <CircularProgress {...props} />;
}
