import { APIRequestContext } from '@playwright/test';

import { upsertUnverifiedSong } from './unverified-songs-admin-helper';

export const upsertCloudflareUnverifiedSongFixture = (request: APIRequestContext) => upsertUnverifiedSong(request);
