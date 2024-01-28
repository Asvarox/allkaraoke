import { PropsWithChildren } from 'react';
import isPrerendering from 'utils/isPrerendering';

export default function NoPrerender(props: PropsWithChildren<{}>) {
  if (isPrerendering) {
    return null;
  }
  return props.children;
}
