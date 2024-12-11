import { isEqual } from 'lodash-es';
import usePrevious from 'modules/hooks/usePrevious';
import { useMemo } from 'react';

export default function useMemoDebugger(memoHook: any, dependencies: any[], dependencyNames: any[] = []) {
  const previousDeps = usePrevious(dependencies);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
          deepEqual: isEqual(previousDeps[index], dependency),
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log('[use-memo-debugger] ', changedDeps);
  }

  // eslint-disable-next-line react-compiler/react-compiler
  return useMemo(memoHook, dependencies);
}
