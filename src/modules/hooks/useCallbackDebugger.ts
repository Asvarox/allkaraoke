import { useCallback } from 'react';
import usePrevious from '~/modules/hooks/usePrevious';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function useCallbackDebugger<T extends Function>(
  callback: T,
  dependencies: unknown[],
  dependencyNames: string[] = [],
) {
  const previousDeps = usePrevious(dependencies);

  const changedDeps = dependencies.reduce<Record<string, { before: unknown; after: unknown }>>(
    (accum, dependency, index) => {
      if (dependency !== previousDeps[index]) {
        const keyName = dependencyNames[index] || index;
        return {
          ...accum,
          [keyName]: {
            before: previousDeps[index],
            after: dependency,
          },
        };
      }

      return accum;
    },
    {},
  );

  if (Object.keys(changedDeps).length) {
    console.log('[use-callback-debugger] ', changedDeps);
  }

  // eslint-disable-next-line react-compiler/react-compiler
  return useCallback(callback, dependencies);
}
