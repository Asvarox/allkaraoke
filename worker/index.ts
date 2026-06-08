import { onRequest as sharedSongBrowserAdminOnRequest } from '../functions/admin/shared-song';
import { onRequest as sharedSongsBrowserAdminOnRequest } from '../functions/admin/shared-songs';
import { onRequest as phDataOnRequest } from '../functions/ph-data/[[catchall]]';
import { onRequest as proxyOnRequest } from '../functions/proxy';
import { onRequest as sharedSongOnRequest } from '../functions/shared-song';
import { onRequest as sharedSongsOnRequest } from '../functions/shared-songs';
import { onRequest as sharedSongsAdminOnRequest } from '../functions/shared-songs-admin';
import { onRequest as sentryTunnelOnRequest } from '../functions/stry-tunnel';

interface WorkerEnv {
  ADMIN_PANEL_PASSWORD?: string;
  ASSETS?: Fetcher;
  SHARED_SONGS_ADMIN_TOKEN?: string;
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

    if (pathname === '/shared-songs') {
      return callPagesHandler(sharedSongsOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/shared-song') {
      return callPagesHandler(sharedSongOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/shared-songs-admin') {
      return callPagesHandler(sharedSongsAdminOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/admin/shared-songs') {
      return callPagesHandler(sharedSongsBrowserAdminOnRequest as PagesLikeHandler, request, env, executionContext);
    }

    if (pathname === '/admin/shared-song') {
      return callPagesHandler(sharedSongBrowserAdminOnRequest as PagesLikeHandler, request, env, executionContext);
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
