import isPreRendering from 'modules/utils/isPreRendering';
import { PropsWithChildren } from 'react';

export default function NoPrerender(props: PropsWithChildren<{}>) {
  console.log(props);
  if (isPreRendering) {
    return null;
  }
  return props.children;
}
