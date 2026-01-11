import { isEqual } from 'es-toolkit';
import { useMemo } from 'react';
import usePrevious from '~/modules/hooks/usePrevious';

export default function useMemoDebugger<T>(memoHook: () => T, dependencies: unknown[], dependencyNames: string[] = []) {
  const previousDeps = usePrevious(dependencies);

  const changedDeps = dependencies.reduce<Record<string, { before: unknown; after: unknown; deepEqual: boolean }>>(
    (accum, dependency, index) => {
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
    },
    {},
  );

  if (Object.keys(changedDeps).length) {
    console.log('[use-memo-debugger] ', changedDeps);
  }

  // eslint-disable-next-line react-compiler/react-compiler
  return useMemo(memoHook, dependencies);
}
