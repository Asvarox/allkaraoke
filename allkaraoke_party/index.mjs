//#region functions/unverified-songs-browser-admin-auth.ts
(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "41bde0e55599bf39e3221224ba2ccd19be94d728" };
		e._sentryModuleMetadata = e._sentryModuleMetadata || {}, e._sentryModuleMetadata[new e.Error().stack] = function(e) {
			for (var n = 1; n < arguments.length; n++) {
				var a = arguments[n];
				if (null != a) for (var t in a) a.hasOwnProperty(t) && (e[t] = a[t]);
			}
			return e;
		}({}, e._sentryModuleMetadata[new e.Error().stack], { "_sentryBundlerPluginAppKey:allkaraoke-party-sentry-key": true });
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "87c6c9fc-895f-40e7-9a15-5ae82948631d", e._sentryDebugIdIdentifier = "sentry-dbid-87c6c9fc-895f-40e7-9a15-5ae82948631d");
	} catch (e) {}
})();
var responseHeaders$3 = { "Content-Type": "application/json" };
var isAuthorizedUnverifiedSongsAdmin = (request, env) => {
	const expectedPassword = env.ADMIN_PANEL_PASSWORD;
	const password = request.headers.get("x-admin-panel-password");
	return !!expectedPassword && password === expectedPassword;
};
var unauthorizedResponse = () => new Response(JSON.stringify({ error: "Unauthorized" }), {
	status: 401,
	headers: responseHeaders$3
});
//#endregion
//#region functions/unverified-songs-env.ts
var getUnverifiedSongsKv = (env) => env.UNVERIFIED_SONGS_KV ?? env.SHARED_SONGS_KV;
var getUnverifiedSongsAdminToken = (env) => env.UNVERIFIED_SONGS_ADMIN_TOKEN ?? env.SHARED_SONGS_ADMIN_TOKEN;
var getUnverifiedSongsRequestToken = (request) => request.headers.get("x-unverified-songs-admin-token") ?? request.headers.get("x-shared-songs-admin-token");
//#endregion
//#region functions/unverified-songs-store.ts
var LEGACY_SHARED_SONG_KEY_PREFIX = "shared-song:";
var LEGACY_SHARED_SONGS_INDEX_KEY = "shared-songs-index";
var getStorageKey = (sharedSongId) => `${LEGACY_SHARED_SONG_KEY_PREFIX}${sharedSongId}`;
var getLegacySharedSongId = (record) => record.sharedSongId ?? record.externalSongId;
var normalizeRecord = (record) => {
	if (!record) return null;
	const sharedSongId = getLegacySharedSongId(record);
	const validatedAt = record.validatedAt ?? record.verifiedAt;
	if (!sharedSongId || typeof validatedAt !== "number") return null;
	return {
		...record,
		sharedSongId,
		externalSongId: sharedSongId,
		validatedAt
	};
};
var normalizeIndexEntry = (entry) => {
	if (!entry) return null;
	const sharedSongId = getLegacySharedSongId(entry);
	if (!sharedSongId) return null;
	return {
		...entry,
		sharedSongId,
		externalSongId: sharedSongId
	};
};
var getIndex = async (kvNamespace) => (await kvNamespace.get(LEGACY_SHARED_SONGS_INDEX_KEY, "json") ?? []).flatMap((entry) => {
	const normalizedEntry = normalizeIndexEntry(entry);
	return normalizedEntry ? [normalizedEntry] : [];
});
var addToIndex = async (kvNamespace, entry) => {
	const nextIndex = [...(await getIndex(kvNamespace)).filter((song) => song.sharedSongId !== entry.sharedSongId), entry];
	await kvNamespace.put(LEGACY_SHARED_SONGS_INDEX_KEY, JSON.stringify(nextIndex));
};
var removeFromIndex = async (kvNamespace, sharedSongId) => {
	const index = await getIndex(kvNamespace);
	await kvNamespace.put(LEGACY_SHARED_SONGS_INDEX_KEY, JSON.stringify(index.filter((song) => song.sharedSongId !== sharedSongId)));
};
var listUnverifiedSongs = async (kvNamespace) => {
	return await getIndex(kvNamespace);
};
var getUnverifiedSong = async (kvNamespace, sharedSongId) => {
	return normalizeRecord(await kvNamespace.get(getStorageKey(sharedSongId), "json"));
};
var upsertUnverifiedSong = async (kvNamespace, record) => {
	const storageKey = getStorageKey(record.sharedSongId);
	const storageRecord = {
		...record,
		externalSongId: record.sharedSongId,
		validatedAt: record.validatedAt
	};
	await kvNamespace.put(storageKey, JSON.stringify(storageRecord));
	await addToIndex(kvNamespace, {
		sharedSongId: record.sharedSongId,
		externalSongId: record.sharedSongId,
		songId: record.songId,
		artist: record.artist,
		title: record.title,
		language: record.language,
		videoId: record.videoId,
		firstSeenAt: record.firstSeenAt,
		updated: record.updated
	});
};
var removeUnverifiedSong = async (kvNamespace, sharedSongId) => {
	if (!await getUnverifiedSong(kvNamespace, sharedSongId)) {
		await removeFromIndex(kvNamespace, sharedSongId);
		return false;
	}
	await kvNamespace.delete(getStorageKey(sharedSongId));
	await removeFromIndex(kvNamespace, sharedSongId);
	return true;
};
var updateUnverifiedSong = async (kvNamespace, sharedSongId, update) => {
	const currentRecord = await getUnverifiedSong(kvNamespace, sharedSongId);
	if (!currentRecord) return false;
	const now = Date.now();
	const updatedRecord = {
		...currentRecord,
		...update,
		sharedSongId,
		externalSongId: sharedSongId,
		updated: now,
		lastSeenAt: now
	};
	await kvNamespace.put(getStorageKey(sharedSongId), JSON.stringify(updatedRecord));
	await addToIndex(kvNamespace, {
		sharedSongId,
		externalSongId: sharedSongId,
		songId: updatedRecord.songId,
		artist: updatedRecord.artist,
		title: updatedRecord.title,
		language: updatedRecord.language,
		videoId: updatedRecord.videoId,
		firstSeenAt: updatedRecord.firstSeenAt,
		updated: updatedRecord.updated
	});
	return true;
};
var regenerateIndex = async (kvNamespace) => {
	const listResponse = await kvNamespace.list({ prefix: LEGACY_SHARED_SONG_KEY_PREFIX });
	const indexEntries = (await Promise.all(listResponse.keys.map(async ({ name }) => {
		return normalizeRecord(await kvNamespace.get(name, "json"));
	}))).filter((record) => record !== null).map(({ sharedSongId, songId, artist, title, language, videoId, firstSeenAt, updated }) => ({
		sharedSongId,
		externalSongId: sharedSongId,
		songId,
		artist,
		title,
		language,
		videoId,
		firstSeenAt,
		updated: updated ?? firstSeenAt
	}));
	await kvNamespace.put(LEGACY_SHARED_SONGS_INDEX_KEY, JSON.stringify(indexEntries));
};
//#endregion
//#region functions/admin/unverified-song.ts
var isUnverifiedSongUpdate = (payload) => {
	if (!payload || typeof payload !== "object") return false;
	const update = payload;
	return typeof update.songId === "string" && typeof update.songTxt === "string" && typeof update.artist === "string" && typeof update.title === "string" && Array.isArray(update.language) && update.language.every((language) => typeof language === "string") && typeof update.videoId === "string";
};
var onRequest$7 = async ({ request, env }) => {
	if (!isAuthorizedUnverifiedSongsAdmin(request, env)) return unauthorizedResponse();
	const unverifiedSongsKv = getUnverifiedSongsKv(env);
	if (!unverifiedSongsKv) return new Response(JSON.stringify({ error: "Unverified songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders$3
	});
	try {
		if (request.method !== "PUT") return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders$3
		});
		const sharedSongId = new URL(request.url).searchParams.get("id")?.trim();
		if (!sharedSongId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
			status: 400,
			headers: responseHeaders$3
		});
		const payload = await request.json();
		if (!isUnverifiedSongUpdate(payload)) return new Response(JSON.stringify({ error: "Invalid song payload" }), {
			status: 400,
			headers: responseHeaders$3
		});
		if (!await updateUnverifiedSong(unverifiedSongsKv, sharedSongId, payload)) return new Response(JSON.stringify({ error: "Song not found" }), {
			status: 404,
			headers: responseHeaders$3
		});
		return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
	} catch (error) {
		console.error("Failed to update unverified song", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders$3
		});
	}
};
//#endregion
//#region functions/admin/unverified-songs.ts
var onRequest$6 = async ({ request, env }) => {
	if (!isAuthorizedUnverifiedSongsAdmin(request, env)) return unauthorizedResponse();
	const unverifiedSongsKv = getUnverifiedSongsKv(env);
	if (!unverifiedSongsKv) return new Response(JSON.stringify({ error: "Unverified songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders$3
	});
	try {
		if (request.method === "GET") {
			const songs = await listUnverifiedSongs(unverifiedSongsKv);
			return new Response(JSON.stringify(songs), { headers: responseHeaders$3 });
		}
		if (request.method === "DELETE") {
			const sharedSongId = new URL(request.url).searchParams.get("id")?.trim();
			if (!sharedSongId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
				status: 400,
				headers: responseHeaders$3
			});
			if (!await removeUnverifiedSong(unverifiedSongsKv, sharedSongId)) return new Response(JSON.stringify({ error: "Song not found" }), {
				status: 404,
				headers: responseHeaders$3
			});
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
		}
		if (request.method === "PUT") {
			await regenerateIndex(unverifiedSongsKv);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
		}
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders$3
		});
	} catch (error) {
		console.error("Failed to administer unverified songs", error);
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
//#region functions/stry-tunnel.ts
var onRequest$3 = async (context) => {
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
//#region functions/unverified-song.ts
var responseHeaders$2 = { "Content-Type": "application/json" };
var onRequest$2 = async ({ request, env }) => {
	try {
		const unverifiedSongsKv = getUnverifiedSongsKv(env);
		if (!unverifiedSongsKv) return new Response(JSON.stringify({ error: "Unverified songs storage is not configured" }), {
			status: 500,
			headers: responseHeaders$2
		});
		const songId = new URL(request.url).searchParams.get("id")?.trim();
		if (!songId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
			status: 400,
			headers: responseHeaders$2
		});
		const unverifiedSong = await getUnverifiedSong(unverifiedSongsKv, songId);
		if (!unverifiedSong) return new Response(JSON.stringify({ error: "Song not found" }), {
			status: 404,
			headers: responseHeaders$2
		});
		return new Response(JSON.stringify({
			sharedSongId: unverifiedSong.sharedSongId,
			externalSongId: unverifiedSong.sharedSongId,
			songId: unverifiedSong.songId,
			artist: unverifiedSong.artist,
			title: unverifiedSong.title,
			language: unverifiedSong.language,
			videoId: unverifiedSong.videoId,
			songTxt: unverifiedSong.songTxt
		}), { headers: responseHeaders$2 });
	} catch (error) {
		console.error("Failed to fetch unverified song", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders$2
		});
	}
};
//#endregion
//#region functions/unverified-songs.ts
var responseHeaders$1 = { "Content-Type": "application/json" };
var onRequest$1 = async ({ request, env }) => {
	try {
		const url = new URL(request.url);
		const query = url.searchParams.get("query")?.trim();
		const rawLimit = Number(url.searchParams.get("limit") ?? "10");
		const limit = Math.min(25, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));
		if (!query) return new Response(JSON.stringify({ error: "Missing query parameter: query" }), {
			status: 400,
			headers: responseHeaders$1
		});
		const unverifiedSongsKv = getUnverifiedSongsKv(env);
		if (!unverifiedSongsKv) return new Response(JSON.stringify({ error: "Unverified songs storage is not configured" }), {
			status: 500,
			headers: responseHeaders$1
		});
		const normalizedQuery = query.toLowerCase();
		const songs = (await listUnverifiedSongs(unverifiedSongsKv)).filter((song) => song.artist.toLowerCase().includes(normalizedQuery) || song.title.toLowerCase().includes(normalizedQuery) || song.language.some((language) => language.toLowerCase().includes(normalizedQuery))).slice(0, limit).map((song) => ({
			sharedSongId: song.sharedSongId,
			externalSongId: song.sharedSongId,
			songId: song.songId,
			artist: song.artist,
			title: song.title,
			language: song.language,
			videoId: song.videoId
		}));
		return new Response(JSON.stringify(songs), { headers: responseHeaders$1 });
	} catch (error) {
		console.error("Failed to fetch unverified songs", error);
		return new Response(JSON.stringify({ error: "Failed to fetch unverified songs" }), {
			status: 500,
			headers: responseHeaders$1
		});
	}
};
//#endregion
//#region functions/unverified-songs-admin.ts
var responseHeaders = { "Content-Type": "application/json" };
var normalizeUnverifiedSongRecord = (payload) => {
	if (!payload || typeof payload !== "object") return null;
	const record = payload;
	const sharedSongId = record.sharedSongId ?? record.externalSongId;
	const validatedAt = record.validatedAt ?? record.verifiedAt;
	return typeof sharedSongId === "string" && typeof record.songId === "string" && typeof record.songTxt === "string" && typeof record.artist === "string" && typeof record.title === "string" && Array.isArray(record.language) && typeof record.videoId === "string" && typeof validatedAt === "number" && typeof record.firstSeenAt === "number" && typeof record.updated === "number" && typeof record.lastSeenAt === "number" && typeof record.sourceUserId === "string" && typeof record.sourceEventAt === "number" ? {
		...record,
		sharedSongId,
		externalSongId: sharedSongId,
		validatedAt
	} : null;
};
var onRequest = async ({ request, env }) => {
	const expectedToken = getUnverifiedSongsAdminToken(env);
	const token = getUnverifiedSongsRequestToken(request);
	if (!expectedToken || token !== expectedToken) return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: responseHeaders
	});
	const unverifiedSongsKv = getUnverifiedSongsKv(env);
	if (!unverifiedSongsKv) return new Response(JSON.stringify({ error: "Unverified songs storage is not configured" }), {
		status: 500,
		headers: responseHeaders
	});
	try {
		if (request.method === "POST") {
			const payload = normalizeUnverifiedSongRecord(await request.json());
			if (!payload) return new Response(JSON.stringify({ error: "Invalid record payload" }), {
				status: 400,
				headers: responseHeaders
			});
			await upsertUnverifiedSong(unverifiedSongsKv, payload);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		if (request.method === "DELETE") {
			const songId = new URL(request.url).searchParams.get("id")?.trim();
			if (!songId) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
				status: 400,
				headers: responseHeaders
			});
			if (!await removeUnverifiedSong(unverifiedSongsKv, songId)) return new Response(JSON.stringify({ error: "Song not found" }), {
				status: 404,
				headers: responseHeaders
			});
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		if (request.method === "PUT") {
			await regenerateIndex(unverifiedSongsKv);
			return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
		}
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: responseHeaders
		});
	} catch (error) {
		console.error("Failed to mutate unverified songs", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: responseHeaders
		});
	}
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
	if (pathname === "/unverified-songs" || pathname === "/shared-songs") return callPagesHandler(onRequest$1, request, env, executionContext);
	if (pathname === "/unverified-song" || pathname === "/shared-song") return callPagesHandler(onRequest$2, request, env, executionContext);
	if (pathname === "/unverified-songs-admin" || pathname === "/shared-songs-admin") return callPagesHandler(onRequest, request, env, executionContext);
	if (pathname === "/admin/unverified-songs" || pathname === "/admin/shared-songs") return callPagesHandler(onRequest$6, request, env, executionContext);
	if (pathname === "/admin/unverified-song" || pathname === "/admin/shared-song") return callPagesHandler(onRequest$7, request, env, executionContext);
	if (pathname === "/proxy") return callPagesHandler(onRequest$4, request, env, executionContext);
	if (pathname === "/stry-tunnel") return callPagesHandler(onRequest$3, request, env, executionContext);
	if (pathname === "/ph-data" || pathname.startsWith("/ph-data/")) return callPagesHandler(onRequest$5, request, env, executionContext, { catchall: pathname.slice(8).split("/").filter(Boolean) });
	return new Response("Not found", { status: 404 });
} };
//#endregion
export { worker_entry_default as default };

//# sourceMappingURL=index.mjs.map