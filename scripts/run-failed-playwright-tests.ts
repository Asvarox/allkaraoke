// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import path from 'path';
import testResults from '../test-results.json';

const testsToRerun = testResults.suites
  .map((result) => result.specs)
  .flat()
  .filter((spec) => !spec.ok)
  .map((spec) => `${path.join(testResults.config.rootDir, spec.file)}:${spec.line}`);

console.log(testsToRerun.join(' ') + (testsToRerun.length ? ' --trace=on' : ''));
