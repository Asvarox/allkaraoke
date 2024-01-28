import { PropsWithChildren } from 'react';
import isPreRendering from 'utils/isPreRendering';

export default function NoPrerender(props: PropsWithChildren<{}>) {
  if (isPreRendering) {
    return null;
  }
  return props.children;
}
