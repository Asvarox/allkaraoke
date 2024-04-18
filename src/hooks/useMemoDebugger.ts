import usePrevious from 'hooks/usePrevious';
import { isEqual } from 'lodash-es';
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

  return useMemo(memoHook, dependencies);
}
