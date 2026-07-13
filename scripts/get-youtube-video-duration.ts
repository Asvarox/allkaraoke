import { createYoutubeDurationProbeClient } from './youtube-duration-client';

const DEFAULT_TIMEOUT_MS = 30000;

function getCliArgument(name: string): string | undefined {
  const argumentsList = getScriptArguments();

  const prefixedArgument = argumentsList.find((argument) => argument.startsWith(`--${name}=`));
  if (prefixedArgument) {
    return prefixedArgument.split('=')[1];
  }

  const argumentIndex = argumentsList.findIndex((argument) => argument === `--${name}`);
  if (argumentIndex >= 0) {
    return argumentsList[argumentIndex + 1];
  }

  return undefined;
}

function getScriptArguments(): string[] {
  const rawArguments = process.argv.slice(2);

  // tsx includes the script path as the first argument.
  if (rawArguments[0]?.endsWith('.ts') || rawArguments[0]?.endsWith('.js')) {
    return rawArguments.slice(1);
  }

  return rawArguments;
}

function getVideoIdFromArgs(): string | undefined {
  const explicitVideoId = getCliArgument('video-id');
  if (explicitVideoId) {
    return explicitVideoId;
  }

  const argumentsList = getScriptArguments();

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument.startsWith('--')) {
      if (!argument.includes('=')) {
        index += 1;
      }
      continue;
    }

    return argument;
  }

  return undefined;
}

async function main(): Promise<void> {
  const videoId = getVideoIdFromArgs();
  if (!videoId) {
    console.error('Usage: pnpm ts-node scripts/get-youtube-video-duration.ts <youtubeVideoId>');
    process.exitCode = 1;
    return;
  }

  const timeoutArgument = getCliArgument('timeout-ms');
  const timeoutMs = timeoutArgument ? Number(timeoutArgument) : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    console.error('Invalid value for --timeout-ms. Expected a positive number.');
    process.exitCode = 1;
    return;
  }

  const durationProbeClient = await createYoutubeDurationProbeClient(timeoutMs);

  try {
    const durationSeconds = await durationProbeClient.getDuration(videoId);
    console.log(durationSeconds);
  } finally {
    await durationProbeClient.close();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
