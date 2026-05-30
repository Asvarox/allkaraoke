import { PropsWithChildren } from 'react';
import isPreRendering from '~/modules/utils/is-pre-rendering';

export default function NoPrerender(props: PropsWithChildren) {
  if (isPreRendering) {
    return null;
  }
  return props.children;
}
