import { isEqual } from 'es-toolkit';
import { EffectCallback, useEffect } from 'react';
import usePrevious from '~/modules/hooks/usePrevious';

export default function useEffectDebugger(
  effectHook: EffectCallback,
  dependencies: unknown[],
  dependencyNames: string[] = [],
) {
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
    console.log('[use-effect-debugger] ', changedDeps);
  }

  useEffect(effectHook, dependencies);
}
