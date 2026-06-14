//#region functions/shared-songs-browser-admin-auth.ts
(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "6a12baffb2f49f12d8cf53dd708416ce62b5f072" };
		e._sentryModuleMetadata = e._sentryModuleMetadata || {}, e._sentryModuleMetadata[new e.Error().stack] = function(e) {
			for (var n = 1; n < arguments.length; n++) {
				var a = arguments[n];
				if (null != a) for (var t in a) a.hasOwnProperty(t) && (e[t] = a[t]);
			}
			return e;
		}({}, e._sentryModuleMetadata[new e.Error().stack], { "_sentryBundlerPluginAppKey:allkaraoke-party-sentry-key": true });
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "4a875833-424b-4899-a821-6aca4fdd5266", e._sentryDebugIdIdentifier = "sentry-dbid-4a875833-424b-4899-a821-6aca4fdd5266");
	} catch (e) {}
})();
var responseHeaders$3 = { "Content-Type": "application/json" };
var isAuthorizedSharedSongsAdmin = (request, env) => {
	const expectedPassword = env.ADMIN_PANEL_PASSWORD;
	const password = request.headers.get("x-admin-panel-password");
	return !!expectedPassword && password === expectedPassword;
};
var unauthorizedResponse = () => new Response(JSON.stringify({ error: "Unauthorized" }), {
	status: 401,
	headers: responseHeaders$3
});
//#endregion
//#region functions/shared-songs-store.ts
var SHARED_SONG_KEY_PREFIX = "shared-song:";
var INDEX_KEY = "shared-songs-index";
var getStorageKey = (externalSongId) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;
var normalizeIndexEntry = (entry) => ({
	externalSongId: "externalSongId" in entry ? entry.externalSongId : entry.songId,
	songId: entry.songId,
	artist: entry.artist,
	title: entry.title,
	language: entry.language,
	videoId: entry.videoId,
	firstSeenAt: "firstSeenAt" in entry ? entry.firstSeenAt : 0
});
var getIndex = async (kvNamespace) => (await kvNamespace.get(INDEX_KEY, "json") ?? []).map(normalizeIndexEntry);
var addToIndex = async (kvNamespace, entry) => {
	const nextIndex = [...(await getIndex(kvNamespace)).filter((song) => song.externalSongId !== entry.externalSongId), entry];
	await kvNamespace.put(INDEX_KEY, JSON.stringify(nextIndex));
};
var removeFromIndex = async (kvNamespace, externalSongId) => {
	const index = await getIndex(kvNamespace);
	await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter((song) => song.externalSongId !== externalSongId)));
};
var listSharedSongs = async (kvNamespace) => {
	return await getIndex(kvNamespace);
};
var getSharedSong = (kvNamespace, externalSongId) => kvNamespace.get(getStorageKey(externalSongId), "json");
var upsertSharedSong = async (kvNamespace, record) => {
	const storageKey = getStorageKey(record.externalSongId);
	await kvNamespace.put(storageKey, JSON.stringify(record));
	await addToIndex(kvNamespace, {
		externalSongId: record.externalSongId,
		songId: record.songId,
		artist: record.artist,
		title: record.title,
		language: record.language,
		videoId: record.videoId,
		firstSeenAt: record.firstSeenAt
	});
};
var removeSharedSong = async (kvNamespace, externalSongId) => {
	if (!await getSharedSong(kvNamespace, externalSongId)) {
		await removeFromIndex(kvNamespace, externalSongId);
		return false;
	}
	await kvNamespace.delete(getStorageKey(externalSongId));
	await removeFromIndex(kvNamespace, externalSongId);
	return true;
};
var updateSharedSong = async (kvNamespace, externalSongId, update) => {
	const currentRecord = await getSharedSong(kvNamespace, externalSongId);
	if (!currentRecord) return false;
	const updatedRecord = {
		...currentRecord,
		...update,
		externalSongId,
		lastSeenAt: Date.now()
	};
	await kvNamespace.put(getStorageKey(externalSongId), JSON.stringify(updatedRecord));
	await addToIndex(kvNamespace, {
		externalSongId,
		songId: updatedRecord.songId,
		artist: updatedRecord.artist,
		title: updatedRecord.title,
		language: updatedRecord.language,
		videoId: updatedRecord.videoId,
		firstSeenAt: updatedRecord.firstSeenAt
	});
	return true;
};
var regenerateIndex = async (kvNamespace) => {
	const listResponse = await kvNamespace.list({ prefix: SHARED_SONG_KEY_PREFIX });
	const indexEntries = (await Promise.all(listResponse.keys.map(async ({ name }) => {
		return await kvNamespace.get(name, "json");
	}))).filter((record) => record !== null).map(({ externalSongId, songId, artist, title, language, videoId, firstSeenAt }) => ({
		externalSongId,
		songId,
		artist,
		title,
		language,
		videoId,
		firstSeenAt
	}));
	await kvNamespace.put(INDEX_KEY, JSON.stringify(indexEntries));
};
//#endregion
//#region functions/admin/shared-song.ts
var isSharedSongUpdate = (payload) => {
	if (!payload || typeof payload !== "object") return false;
	const update = payload;
	return typeof update.songId === "string" && typeof update.songTxt === "string" && typeof update.artist === "string" && typeof update.title === "string" && Array.isArray(update.language) && update.language.every((language) => typeof language === "string") && typeof update.videoId === "string";
};
var onRequest$7 = async ({ request, env }) => {
	if (!isAuthorizedSharedSongsAdmin(request, env)) return unauthorizedResponse();
	if (!env.SHARED_SONGS_KV) return new Response(JSON.stringify({ error: "Shared songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders$3
	});
	try {
		if (request.method !== "PUT") return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders$3
		});
		const externalSongId = new URL(request.url).searchParams.get("id")?.trim();
		if (!externalSongId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
			status: 400,
			headers: responseHeaders$3
		});
		const payload = await request.json();
		if (!isSharedSongUpdate(payload)) return new Response(JSON.stringify({ error: "Invalid song payload" }), {
			status: 400,
			headers: responseHeaders$3
		});
		if (!await updateSharedSong(env.SHARED_SONGS_KV, externalSongId, payload)) return new Response(JSON.stringify({ error: "Song not found" }), {
			status: 404,
			headers: responseHeaders$3
		});
		return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
	} catch (error) {
		console.error("Failed to update shared song", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders$3
		});
	}
};
//#endregion
//#region functions/admin/shared-songs.ts
var onRequest$6 = async ({ request, env }) => {
	if (!isAuthorizedSharedSongsAdmin(request, env)) return unauthorizedResponse();
	if (!env.SHARED_SONGS_KV) return new Response(JSON.stringify({ error: "Shared songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders$3
	});
	try {
		if (request.method === "GET") {
			const songs = await listSharedSongs(env.SHARED_SONGS_KV);
			return new Response(JSON.stringify(songs), { headers: responseHeaders$3 });
		}
		if (request.method === "DELETE") {
			const externalSongId = new URL(request.url).searchParams.get("id")?.trim();
			if (!externalSongId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
				status: 400,
				headers: responseHeaders$3
			});
			if (!await removeSharedSong(env.SHARED_SONGS_KV, externalSongId)) return new Response(JSON.stringify({ error: "Song not found" }), {
				status: 404,
				headers: responseHeaders$3
			});
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
		}
		if (request.method === "PUT") {
			await regenerateIndex(env.SHARED_SONGS_KV);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
		}
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders$3
		});
	} catch (error) {
		console.error("Failed to administer shared songs", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders$3
		});
	}
};
//#endregion
//#region functions/ph-data/[[catchall]].ts
var API_HOST = "eu.i.posthog.com";
var ASSET_HOST = "eu-assets.i.posthog.com";
async function handleRequest(context) {
	const url = new URL(context.request.url);
	const pathname = context.params.catchall.join("/");
	const pathWithParams = pathname + url.search;
	if (pathname.startsWith("/static/")) return retrieveStatic(context, pathWithParams);
	else return forwardRequest(context, pathWithParams);
}
async function retrieveStatic({ request, waitUntil }, pathname) {
	let response = await caches.default.match(request);
	if (!response) {
		response = await fetch(`https://${ASSET_HOST}/${pathname}`);
		waitUntil(caches.default.put(request, response.clone()));
	}
	return response;
}
async function forwardRequest({ request }, pathWithSearch) {
	const originRequest = new Request(request);
	originRequest.headers.delete("cookie");
	return await fetch(`https://${API_HOST}/${pathWithSearch}`, originRequest);
}
var onRequest$5 = (context) => {
	return handleRequest(context);
};
//#endregion
//#region functions/proxy.ts
var onRequest$4 = async (context) => {
	const hostAllowList = ["ultrastar-es.org", "usdb.animux.de"];
	try {
		const url = new URL(context.request.url);
		const targetUrl = new URL(url.searchParams.get("url"));
		if (!hostAllowList.includes(targetUrl.hostname)) throw new Error("Invalid hostname");
		const originalResponse = await fetch(targetUrl.toString(), {
			method: context.request.method,
			headers: { ...context.request.headers ?? {} },
			...["get", "head"].includes(context.request.method.toLowerCase()) ? {} : { body: context.request.body }
		});
		const response = new Response(originalResponse.body, {
			status: originalResponse.status,
			statusText: originalResponse.statusText,
			headers: originalResponse.headers
		});
		response.headers.set("Content-Security-Policy", "default-src 'self' allkaraoke.party *.allkaraoke.party localhost");
		return response;
	} catch (e) {
		console.error(e);
		return new Response();
	}
};
//#endregion
//#region functions/shared-song.ts
var responseHeaders$2 = { "Content-Type": "application/json" };
var onRequest$3 = async ({ request, env }) => {
	try {
		if (!env.SHARED_SONGS_KV) return new Response(JSON.stringify({ error: "Shared songs storage is not configured" }), {
			status: 500,
			headers: responseHeaders$2
		});
		const songId = new URL(request.url).searchParams.get("id")?.trim();
		if (!songId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
			status: 400,
			headers: responseHeaders$2
		});
		const sharedSong = await getSharedSong(env.SHARED_SONGS_KV, songId);
		if (!sharedSong) return new Response(JSON.stringify({ error: "Song not found" }), {
			status: 404,
			headers: responseHeaders$2
		});
		return new Response(JSON.stringify({
			externalSongId: sharedSong.externalSongId,
			songId: sharedSong.songId,
			artist: sharedSong.artist,
			title: sharedSong.title,
			language: sharedSong.language,
			videoId: sharedSong.videoId,
			songTxt: sharedSong.songTxt
		}), { headers: responseHeaders$2 });
	} catch (error) {
		console.error("Failed to fetch shared song", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders$2
		});
	}
};
//#endregion
//#region functions/shared-songs.ts
var responseHeaders$1 = { "Content-Type": "application/json" };
var onRequest$2 = async ({ request, env }) => {
	try {
		const url = new URL(request.url);
		const query = url.searchParams.get("query")?.trim();
		const rawLimit = Number(url.searchParams.get("limit") ?? "10");
		const limit = Math.min(25, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));
		if (!query) return new Response(JSON.stringify({ error: "Missing query parameter: query" }), {
			status: 400,
			headers: responseHeaders$1
		});
		if (!env.SHARED_SONGS_KV) return new Response(JSON.stringify({ error: "Shared songs storage is not configured" }), {
			status: 500,
			headers: responseHeaders$1
		});
		const normalizedQuery = query.toLowerCase();
		const songs = (await listSharedSongs(env.SHARED_SONGS_KV)).filter((song) => song.artist.toLowerCase().includes(normalizedQuery) || song.title.toLowerCase().includes(normalizedQuery) || song.language.some((language) => language.toLowerCase().includes(normalizedQuery))).slice(0, limit).map((song) => ({
			externalSongId: song.externalSongId,
			songId: song.songId,
			artist: song.artist,
			title: song.title,
			language: song.language,
			videoId: song.videoId
		}));
		return new Response(JSON.stringify(songs), { headers: responseHeaders$1 });
	} catch (error) {
		console.error("Failed to fetch shared songs", error);
		return new Response(JSON.stringify({ error: "Failed to fetch shared songs" }), {
			status: 500,
			headers: responseHeaders$1
		});
	}
};
//#endregion
//#region functions/shared-songs-admin.ts
var responseHeaders = { "Content-Type": "application/json" };
var isSharedSongRecord = (payload) => {
	if (!payload || typeof payload !== "object") return false;
	const record = payload;
	return typeof record.externalSongId === "string" && typeof record.songId === "string" && typeof record.songTxt === "string" && typeof record.artist === "string" && typeof record.title === "string" && Array.isArray(record.language) && typeof record.videoId === "string" && typeof record.verifiedAt === "number" && typeof record.firstSeenAt === "number" && typeof record.lastSeenAt === "number" && typeof record.sourceUserId === "string" && typeof record.sourceEventAt === "number";
};
var onRequest$1 = async ({ request, env }) => {
	const expectedToken = env.SHARED_SONGS_ADMIN_TOKEN;
	const token = request.headers.get("x-shared-songs-admin-token");
	if (!expectedToken || token !== expectedToken) return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: responseHeaders
	});
	if (!env.SHARED_SONGS_KV) return new Response(JSON.stringify({ error: "Shared songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders
	});
	try {
		if (request.method === "POST") {
			const payload = await request.json();
			if (!isSharedSongRecord(payload)) return new Response(JSON.stringify({ error: "Invalid record payload" }), {
				status: 400,
				headers: responseHeaders
			});
			await upsertSharedSong(env.SHARED_SONGS_KV, payload);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		if (request.method === "DELETE") {
			const songId = new URL(request.url).searchParams.get("id")?.trim();
			if (!songId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
				status: 400,
				headers: responseHeaders
			});
			if (!await removeSharedSong(env.SHARED_SONGS_KV, songId)) return new Response(JSON.stringify({ error: "Song not found" }), {
				status: 404,
				headers: responseHeaders
			});
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		if (request.method === "PUT") {
			await regenerateIndex(env.SHARED_SONGS_KV);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders
		});
	} catch (error) {
		console.error("Failed to mutate shared songs", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders
		});
	}
};
//#endregion
//#region functions/stry-tunnel.ts
var onRequest = async (context) => {
	const bodyString = await context.request.text();
	const [data] = bodyString.split("\n");
	const { dsn } = JSON.parse(data);
	const url = `https://sentry.io/api${new URL(dsn).pathname}/envelope/`;
	return await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-sentry-envelope" },
		body: bodyString
	});
};
//#endregion
//#region worker/index.ts
var createContext = (request, env, executionContext, params) => {
	return {
		request,
		env,
		params,
		waitUntil: executionContext.waitUntil.bind(executionContext),
		next: async () => new Response("Not found", { status: 404 }),
		data: {},
		functionPath: ""
	};
};
var callPagesHandler = (handler, request, env, executionContext, params = {}) => {
	return handler(createContext(request, env, executionContext, params));
};
//#endregion
//#region \0virtual:cloudflare/worker-entry
var worker_entry_default = { fetch(request, env, executionContext) {
	const { pathname } = new URL(request.url);
	if (pathname === "/shared-songs") return callPagesHandler(onRequest$2, request, env, executionContext);
	if (pathname === "/shared-song") return callPagesHandler(onRequest$3, request, env, executionContext);
	if (pathname === "/shared-songs-admin") return callPagesHandler(onRequest$1, request, env, executionContext);
	if (pathname === "/admin/shared-songs") return callPagesHandler(onRequest$6, request, env, executionContext);
	if (pathname === "/admin/shared-song") return callPagesHandler(onRequest$7, request, env, executionContext);
	if (pathname === "/proxy") return callPagesHandler(onRequest$4, request, env, executionContext);
	if (pathname === "/stry-tunnel") return callPagesHandler(onRequest, request, env, executionContext);
	if (pathname === "/ph-data" || pathname.startsWith("/ph-data/")) return callPagesHandler(onRequest$5, request, env, executionContext, { catchall: pathname.slice(8).split("/").filter(Boolean) });
	return new Response("Not found", { status: 404 });
} };
//#endregion
export { worker_entry_default as default };

//# sourceMappingURL=index.mjs.map