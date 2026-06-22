import { onRequest as unverifiedSongBrowserAdminOnRequest } from '../functions/admin/unverified-song';
import { onRequest as unverifiedSongsBrowserAdminOnRequest } from '../functions/admin/unverified-songs';
import { onRequest as phDataOnRequest } from '../functions/ph-data/[[catchall]]';
import { onRequest as proxyOnRequest } from '../functions/proxy';
import { onRequest as sentryTunnelOnRequest } from '../functions/stry-tunnel';
import { onRequest as unverifiedSongOnRequest } from '../functions/unverified-song';
import { onRequest as unverifiedSongsOnRequest } from '../functions/unverified-songs';
import { onRequest as unverifiedSongsAdminOnRequest } from '../functions/unverified-songs-admin';

interface WorkerEnv {
  ADMIN_PANEL_PASSWORD?: string;
  ASSETS?: Fetcher;
  UNVERIFIED_SONGS_ADMIN_TOKEN?: string;
  SHARED_SONGS_ADMIN_TOKEN?: string;
  UNVERIFIED_SONGS_KV?: KVNamespace;
  SHARED_SONGS_KV?: KVNamespace;
}

type WorkerRouteParams = Record<string, string | string[]>;

type PagesLikeContext = {
  request: Request;
  env: WorkerEnv;
  params: WorkerRouteParams;
  waitUntil: ExecutionContext['waitUntil'];
  next: () => Promise<Response>;
  data: unknown;
  functionPath: string;
};

type PagesLikeHandler = (context: PagesLikeContext) => Promise<Response> | Response;

const createContext = (
  request: Request,
  env: WorkerEnv,
  executionContext: ExecutionContext,
  params: WorkerRouteParams,
) => {
  const context: PagesLikeContext = {
    request,
    env,
    params,
    waitUntil: executionContext.waitUntil.bind(executionContext),
    next: async () => new Response('Not found', { status: 404 }),
    data: {},
    functionPath: '',
  };

  return context;
};

const callPagesHandler = (
  handler: PagesLikeHandler,
  request: Request,
  env: WorkerEnv,
  executionContext: ExecutionContext,
  params: WorkerRouteParams = {},
) => {
  return handler(createContext(request, env, executionContext, params));
};

export default {
  fetch(request, env, executionContext) {
    const { pathname } = new URL(request.url);

    if (pathname === '/unverified-songs' || pathname === '/shared-songs') {
      return callPagesHandler(unverifiedSongsOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/unverified-song' || pathname === '/shared-song') {
      return callPagesHandler(unverifiedSongOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/unverified-songs-admin' || pathname === '/shared-songs-admin') {
      return callPagesHandler(unverifiedSongsAdminOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/admin/unverified-songs' || pathname === '/admin/shared-songs') {
      return callPagesHandler(unverifiedSongsBrowserAdminOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/admin/unverified-song' || pathname === '/admin/shared-song') {
      return callPagesHandler(unverifiedSongBrowserAdminOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/proxy') {
      return callPagesHandler(proxyOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/stry-tunnel') {
      return callPagesHandler(sentryTunnelOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/ph-data' || pathname.startsWith('/ph-data/')) {
      const catchallPath = pathname.slice('/ph-data'.length).split('/').filter(Boolean);
      return callPagesHandler(phDataOnRequest as PagesLikeHandler, request, env, executionContext, {
        catchall: catchallPath,
      });
    }

    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<WorkerEnv>;
