#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const skipReleaseNotesPatterns = [
  /\[skip-release-notes\]/i,
  /^Merge\b/i,
  /^Update songs from user\b/i,
  /update visual regression snapshots/i,
];

export function filterReleaseNoteCommitMessages(commitSubjects) {
  return commitSubjects.filter((subject) => !skipReleaseNotesPatterns.some((pattern) => pattern.test(subject)));
}

export function getReleaseNoteCommitMessages({ startCommit, endCommit }) {
  if (!endCommit) {
    throw new Error('Missing end commit');
  }

  const gitArgs =
    startCommit && startCommit.trim() !== ''
      ? ['log', '--format=%s', `${startCommit}..${endCommit}`]
      : ['log', '--format=%s', '-1', endCommit];

  const commitSubjects = execFileSync('git', gitArgs, { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return filterReleaseNoteCommitMessages(commitSubjects);
}

function printUsageAndExit() {
  console.error('Usage: node scripts/cicd/get-release-note-commits.mjs <startCommit> <endCommit>');
  console.error('   or: node scripts/cicd/get-release-note-commits.mjs <endCommit>');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.length > 2) {
    printUsageAndExit();
  }

  const [startOrEndCommit, maybeEndCommit] = args;
  const startCommit = maybeEndCommit ? startOrEndCommit : undefined;
  const endCommit = maybeEndCommit ?? startOrEndCommit;
  const messages = getReleaseNoteCommitMessages({ startCommit, endCommit });

  process.stdout.write(`${JSON.stringify({ messages }, null, 2)}\n`);
}
