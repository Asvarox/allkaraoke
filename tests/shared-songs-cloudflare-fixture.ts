import { APIRequestContext } from '@playwright/test';
import { upsertSharedSong } from './shared-songs-admin-helper';

export const upsertCloudflareSharedSongFixture = (request: APIRequestContext) => upsertSharedSong(request);
