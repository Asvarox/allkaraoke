(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "8905646feea404b5b9d75132c0d5d917d791ca4c" };
		e._sentryModuleMetadata = e._sentryModuleMetadata || {}, e._sentryModuleMetadata[new e.Error().stack] = function(e) {
			for (var n = 1; n < arguments.length; n++) {
				var a = arguments[n];
				if (null != a) for (var t in a) a.hasOwnProperty(t) && (e[t] = a[t]);
			}
			return e;
		}({}, e._sentryModuleMetadata[new e.Error().stack], { "_sentryBundlerPluginAppKey:allkaraoke-party-sentry-key": true });
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "5002fe23-78e9-4b82-9d2c-e64bebf5a5bf", e._sentryDebugIdIdentifier = "sentry-dbid-5002fe23-78e9-4b82-9d2c-e64bebf5a5bf");
	} catch (e) {}
})();
import { DurableObject } from "cloudflare:workers";
//#region functions/unverified-songs-browser-admin-auth.ts
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
//#region node_modules/.pnpm/msgpackr@2.0.4/node_modules/msgpackr/unpack.js
var decoder;
try {
	decoder = new TextDecoder();
} catch (error) {}
var src;
var srcEnd;
var position$1 = 0;
var EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings$1;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
	useRecords: false,
	mapsAsObjects: true
};
var C1Type = class {};
var C1 = new C1Type();
C1.name = "MessagePack 0xC1";
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var Unpackr = class Unpackr {
	constructor(options) {
		if (options) {
			if (options.useRecords === false && options.mapsAsObjects === void 0) options.mapsAsObjects = true;
			if (options.sequential && options.trusted !== false) {
				options.trusted = true;
				if (!options.structures && options.useRecords != false) {
					options.structures = [];
					if (!options.maxSharedStructures) options.maxSharedStructures = 0;
				}
			}
			if (options.structures) options.structures.sharedLength = options.structures.length;
			else if (options.getStructures) {
				(options.structures = []).uninitialized = true;
				options.structures.sharedLength = 0;
			}
			if (options.int64AsNumber) options.int64AsType = "number";
		}
		Object.assign(this, options);
	}
	unpack(source, options) {
		if (src) return saveState(() => {
			clearSource();
			return this ? this.unpack(source, options) : Unpackr.prototype.unpack.call(defaultOptions, source, options);
		});
		if (!source.buffer && source.constructor === ArrayBuffer) source = typeof Buffer !== "undefined" ? Buffer.from(source) : new Uint8Array(source);
		if (typeof options === "object") {
			srcEnd = options.end || source.length;
			position$1 = options.start || 0;
		} else {
			position$1 = 0;
			srcEnd = options > -1 ? options : source.length;
		}
		stringPosition = 0;
		srcStringEnd = 0;
		srcString = null;
		strings = EMPTY_ARRAY;
		bundledStrings$1 = null;
		src = source;
		try {
			dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
		} catch (error) {
			src = null;
			if (source instanceof Uint8Array) throw error;
			throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
		}
		if (this instanceof Unpackr) {
			currentUnpackr = this;
			if (this.structures) {
				currentStructures = this.structures;
				return checkedRead(options);
			} else if (!currentStructures || currentStructures.length > 0) currentStructures = [];
		} else {
			currentUnpackr = defaultOptions;
			if (!currentStructures || currentStructures.length > 0) currentStructures = [];
		}
		return checkedRead(options);
	}
	unpackMultiple(source, forEach) {
		let values, lastPosition = 0;
		try {
			sequentialMode = true;
			let size = source.length;
			let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
			if (forEach) {
				if (forEach(value, lastPosition, position$1) === false) return;
				while (position$1 < size) {
					lastPosition = position$1;
					if (forEach(checkedRead(), lastPosition, position$1) === false) return;
				}
			} else {
				values = [value];
				while (position$1 < size) {
					lastPosition = position$1;
					values.push(checkedRead());
				}
				return values;
			}
		} catch (error) {
			error.lastPosition = lastPosition;
			error.values = values;
			throw error;
		} finally {
			sequentialMode = false;
			clearSource();
		}
	}
	_mergeStructures(loadedStructures, existingStructures) {
		if (this._onLoadedStructures) loadedStructures = this._onLoadedStructures(loadedStructures);
		loadedStructures = loadedStructures || [];
		if (Object.isFrozen(loadedStructures)) loadedStructures = loadedStructures.map((structure) => structure.slice(0));
		for (let i = 0, l = loadedStructures.length; i < l; i++) {
			let structure = loadedStructures[i];
			if (structure) {
				structure.isShared = true;
				if (i >= 32) structure.highByte = i - 32 >> 5;
			}
		}
		loadedStructures.sharedLength = loadedStructures.length;
		for (let id in existingStructures || []) if (id >= 0) {
			let structure = loadedStructures[id];
			let existing = existingStructures[id];
			if (existing) {
				if (structure) (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
				loadedStructures[id] = existing;
			}
		}
		return this.structures = loadedStructures;
	}
	decode(source, options) {
		return this.unpack(source, options);
	}
};
function checkedRead(options) {
	try {
		if (!currentUnpackr.trusted && !sequentialMode) {
			let sharedLength = currentStructures.sharedLength || 0;
			if (sharedLength < currentStructures.length) currentStructures.length = sharedLength;
		}
		let result;
		if (currentUnpackr._readStruct && src[position$1] < 64 && src[position$1] >= 32) {
			result = currentUnpackr._readStruct(src, position$1, srcEnd);
			src = null;
			if (!(options && options.lazy) && result) result = result.toJSON();
			position$1 = srcEnd;
		} else result = read();
		if (bundledStrings$1) {
			position$1 = bundledStrings$1.postBundlePosition;
			bundledStrings$1 = null;
		}
		if (sequentialMode) currentStructures.restoreStructures = null;
		if (position$1 == srcEnd) {
			if (currentStructures && currentStructures.restoreStructures) restoreStructures();
			currentStructures = null;
			src = null;
			if (referenceMap) referenceMap = null;
		} else if (position$1 > srcEnd) throw new Error("Unexpected end of MessagePack data");
		else if (!sequentialMode) {
			let jsonView;
			try {
				jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
			} catch (error) {
				jsonView = "(JSON view not available " + error + ")";
			}
			throw new Error("Data read, but end of buffer not reached " + jsonView);
		}
		return result;
	} catch (error) {
		if (currentStructures && currentStructures.restoreStructures) restoreStructures();
		clearSource();
		if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position$1 > srcEnd) error.incomplete = true;
		throw error;
	}
}
function restoreStructures() {
	for (let id in currentStructures.restoreStructures) currentStructures[id] = currentStructures.restoreStructures[id];
	currentStructures.restoreStructures = null;
}
function read() {
	let token = src[position$1++];
	if (token < 160) {
		if (token < 128) {
			if (token < 64) return token;
			else {
				let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
				if (structure) {
					if (!structure.read) structure.read = createStructureReader(structure, token & 63);
					return structure.read();
				} else return token;
			}
		} else if (token < 144) {
			token -= 128;
			if (currentUnpackr.mapsAsObjects) {
				let object = {};
				for (let i = 0; i < token; i++) {
					let key = readKey();
					if (key === "__proto__") key = "__proto_";
					object[key] = read();
				}
				return object;
			} else {
				let map = /* @__PURE__ */ new Map();
				for (let i = 0; i < token; i++) map.set(read(), read());
				return map;
			}
		} else {
			token -= 144;
			let array = new Array(token);
			for (let i = 0; i < token; i++) array[i] = read();
			if (currentUnpackr.freezeData) return Object.freeze(array);
			return array;
		}
	} else if (token < 192) {
		let length = token - 160;
		if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart);
		if (srcStringEnd == 0 && srcEnd < 140) {
			let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
			if (string != null) return string;
		}
		return readFixedString(length);
	} else {
		let value;
		switch (token) {
			case 192: return null;
			case 193:
				if (bundledStrings$1) {
					value = read();
					if (value > 0) return bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value);
					else return bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 -= value);
				}
				return C1;
			case 194: return false;
			case 195: return true;
			case 196:
				value = src[position$1++];
				if (value === void 0) throw new Error("Unexpected end of buffer");
				return readBin(value);
			case 197:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readBin(value);
			case 198:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readBin(value);
			case 199: return readExt(src[position$1++]);
			case 200:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readExt(value);
			case 201:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readExt(value);
			case 202:
				value = dataView.getFloat32(position$1);
				if (currentUnpackr.useFloat32 > 2) {
					let multiplier = mult10[(src[position$1] & 127) << 1 | src[position$1 + 1] >> 7];
					position$1 += 4;
					return (multiplier * value + (value > 0 ? .5 : -.5) >> 0) / multiplier;
				}
				position$1 += 4;
				return value;
			case 203:
				value = dataView.getFloat64(position$1);
				position$1 += 8;
				return value;
			case 204: return src[position$1++];
			case 205:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return value;
			case 206:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return value;
			case 207:
				if (currentUnpackr.int64AsType === "number") {
					value = dataView.getUint32(position$1) * 4294967296;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === "string") value = dataView.getBigUint64(position$1).toString();
				else if (currentUnpackr.int64AsType === "auto") {
					value = dataView.getBigUint64(position$1);
					if (value <= BigInt(2) << BigInt(52)) value = Number(value);
				} else value = dataView.getBigUint64(position$1);
				position$1 += 8;
				return value;
			case 208: return dataView.getInt8(position$1++);
			case 209:
				value = dataView.getInt16(position$1);
				position$1 += 2;
				return value;
			case 210:
				value = dataView.getInt32(position$1);
				position$1 += 4;
				return value;
			case 211:
				if (currentUnpackr.int64AsType === "number") {
					value = dataView.getInt32(position$1) * 4294967296;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === "string") value = dataView.getBigInt64(position$1).toString();
				else if (currentUnpackr.int64AsType === "auto") {
					value = dataView.getBigInt64(position$1);
					if (value >= BigInt(-2) << BigInt(52) && value <= BigInt(2) << BigInt(52)) value = Number(value);
				} else value = dataView.getBigInt64(position$1);
				position$1 += 8;
				return value;
			case 212:
				value = src[position$1++];
				if (value == 114) return recordDefinition(src[position$1++] & 63);
				else {
					let extension = currentExtensions[value];
					if (extension) {
						if (extension.read) {
							position$1++;
							return extension.read(read());
						} else if (extension.noBuffer) {
							position$1++;
							return extension();
						} else return extension(src.subarray(position$1, ++position$1));
					} else throw new Error("Unknown extension " + value);
				}
			case 213:
				value = src[position$1];
				if (value == 114) {
					position$1++;
					return recordDefinition(src[position$1++] & 63, src[position$1++]);
				} else return readExt(2);
			case 214: return readExt(4);
			case 215: return readExt(8);
			case 216: return readExt(16);
			case 217:
				value = src[position$1++];
				if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
				return readString8(value);
			case 218:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
				return readString16(value);
			case 219:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart);
				return readString32(value);
			case 220:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readArray(value);
			case 221:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readArray(value);
			case 222:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readMap(value);
			case 223:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readMap(value);
			default:
				if (token >= 224) return token - 256;
				if (token === void 0) {
					let error = /* @__PURE__ */ new Error("Unexpected end of MessagePack data");
					error.incomplete = true;
					throw error;
				}
				throw new Error("Unknown MessagePack token " + token);
		}
	}
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
	function readObject() {
		if (readObject.count++ > inlineObjectReadThreshold) {
			let optimizedReadObject;
			try {
				optimizedReadObject = structure.read = new Function("r", "return function(){return " + (currentUnpackr.freezeData ? "Object.freeze" : "") + "({" + structure.map((key) => key === "__proto__" ? "__proto_:r()" : validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "})}")(read);
			} catch (error) {
				inlineObjectReadThreshold = Infinity;
				return readObject();
			}
			structure.read0 = optimizedReadObject;
			if (structure.highByte === 0) structure.read = createSecondByteReader(firstId, structure.read);
			return optimizedReadObject();
		}
		let object = {};
		for (let i = 0, l = structure.length; i < l; i++) {
			let key = structure[i];
			if (key === "__proto__") key = "__proto_";
			object[key] = read();
		}
		if (currentUnpackr.freezeData) return Object.freeze(object);
		return object;
	}
	readObject.count = 0;
	structure.read0 = readObject;
	if (structure.highByte === 0) return createSecondByteReader(firstId, readObject);
	return readObject;
}
var createSecondByteReader = (firstId, read0) => {
	return function() {
		let highByte = src[position$1++];
		if (highByte === 0) return read0();
		let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
		let structure = currentStructures[id] || loadStructures()[id];
		if (!structure) throw new Error("Record id is not defined for " + id);
		if (!structure.read) structure.read = createStructureReader(structure, firstId);
		return structure.read();
	};
};
function loadStructures() {
	let loadedStructures = saveState(() => {
		src = null;
		return currentUnpackr.getStructures();
	});
	return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}
var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
function readStringJS(length) {
	let result;
	if (length < 16) {
		if (result = shortStringInJS(length)) return result;
	}
	if (length > 64 && decoder) return decoder.decode(src.subarray(position$1, position$1 += length));
	const end = position$1 + length;
	const units = [];
	result = "";
	while (position$1 < end) {
		const byte1 = src[position$1++];
		if ((byte1 & 128) === 0) units.push(byte1);
		else if ((byte1 & 224) === 192) {
			const byte2 = src[position$1++] & 63;
			const codePoint = (byte1 & 31) << 6 | byte2;
			if (codePoint < 128) units.push(65533);
			else units.push(codePoint);
		} else if ((byte1 & 240) === 224) {
			const byte2 = src[position$1++] & 63;
			const byte3 = src[position$1++] & 63;
			const codePoint = (byte1 & 31) << 12 | byte2 << 6 | byte3;
			if (codePoint < 2048 || codePoint >= 55296 && codePoint <= 57343) units.push(65533);
			else units.push(codePoint);
		} else if ((byte1 & 248) === 240) {
			const byte2 = src[position$1++] & 63;
			const byte3 = src[position$1++] & 63;
			const byte4 = src[position$1++] & 63;
			let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
			if (unit < 65536 || unit > 1114111) units.push(65533);
			else if (unit > 65535) {
				unit -= 65536;
				units.push(unit >>> 10 & 1023 | 55296);
				unit = 56320 | unit & 1023;
				units.push(unit);
			} else units.push(unit);
		} else units.push(65533);
		if (units.length >= 4096) {
			result += fromCharCode.apply(String, units);
			units.length = 0;
		}
	}
	if (units.length > 0) result += fromCharCode.apply(String, units);
	return result;
}
function readArray(length) {
	let array = new Array(length);
	for (let i = 0; i < length; i++) array[i] = read();
	if (currentUnpackr.freezeData) return Object.freeze(array);
	return array;
}
function readMap(length) {
	if (currentUnpackr.mapsAsObjects) {
		let object = {};
		for (let i = 0; i < length; i++) {
			let key = readKey();
			if (key === "__proto__") key = "__proto_";
			object[key] = read();
		}
		return object;
	} else {
		let map = /* @__PURE__ */ new Map();
		for (let i = 0; i < length; i++) map.set(read(), read());
		return map;
	}
}
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
	let start = position$1;
	let bytes = new Array(length);
	for (let i = 0; i < length; i++) {
		const byte = src[position$1++];
		if ((byte & 128) > 0) {
			position$1 = start;
			return;
		}
		bytes[i] = byte;
	}
	return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
	if (length < 4) {
		if (length < 2) {
			if (length === 0) return "";
			else {
				let a = src[position$1++];
				if ((a & 128) > 1) {
					position$1 -= 1;
					return;
				}
				return fromCharCode(a);
			}
		} else {
			let a = src[position$1++];
			let b = src[position$1++];
			if ((a & 128) > 0 || (b & 128) > 0) {
				position$1 -= 2;
				return;
			}
			if (length < 3) return fromCharCode(a, b);
			let c = src[position$1++];
			if ((c & 128) > 0) {
				position$1 -= 3;
				return;
			}
			return fromCharCode(a, b, c);
		}
	} else {
		let a = src[position$1++];
		let b = src[position$1++];
		let c = src[position$1++];
		let d = src[position$1++];
		if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
			position$1 -= 4;
			return;
		}
		if (length < 6) {
			if (length === 4) return fromCharCode(a, b, c, d);
			else {
				let e = src[position$1++];
				if ((e & 128) > 0) {
					position$1 -= 5;
					return;
				}
				return fromCharCode(a, b, c, d, e);
			}
		} else if (length < 8) {
			let e = src[position$1++];
			let f = src[position$1++];
			if ((e & 128) > 0 || (f & 128) > 0) {
				position$1 -= 6;
				return;
			}
			if (length < 7) return fromCharCode(a, b, c, d, e, f);
			let g = src[position$1++];
			if ((g & 128) > 0) {
				position$1 -= 7;
				return;
			}
			return fromCharCode(a, b, c, d, e, f, g);
		} else {
			let e = src[position$1++];
			let f = src[position$1++];
			let g = src[position$1++];
			let h = src[position$1++];
			if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
				position$1 -= 8;
				return;
			}
			if (length < 10) {
				if (length === 8) return fromCharCode(a, b, c, d, e, f, g, h);
				else {
					let i = src[position$1++];
					if ((i & 128) > 0) {
						position$1 -= 9;
						return;
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i);
				}
			} else if (length < 12) {
				let i = src[position$1++];
				let j = src[position$1++];
				if ((i & 128) > 0 || (j & 128) > 0) {
					position$1 -= 10;
					return;
				}
				if (length < 11) return fromCharCode(a, b, c, d, e, f, g, h, i, j);
				let k = src[position$1++];
				if ((k & 128) > 0) {
					position$1 -= 11;
					return;
				}
				return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
			} else {
				let i = src[position$1++];
				let j = src[position$1++];
				let k = src[position$1++];
				let l = src[position$1++];
				if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
					position$1 -= 12;
					return;
				}
				if (length < 14) {
					if (length === 12) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
					else {
						let m = src[position$1++];
						if ((m & 128) > 0) {
							position$1 -= 13;
							return;
						}
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
					}
				} else {
					let m = src[position$1++];
					let n = src[position$1++];
					if ((m & 128) > 0 || (n & 128) > 0) {
						position$1 -= 14;
						return;
					}
					if (length < 15) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
					let o = src[position$1++];
					if ((o & 128) > 0) {
						position$1 -= 15;
						return;
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
				}
			}
		}
	}
}
function readOnlyJSString() {
	let token = src[position$1++];
	let length;
	if (token < 192) length = token - 160;
	else switch (token) {
		case 217:
			length = src[position$1++];
			break;
		case 218:
			length = dataView.getUint16(position$1);
			position$1 += 2;
			break;
		case 219:
			length = dataView.getUint32(position$1);
			position$1 += 4;
			break;
		default: throw new Error("Expected string");
	}
	return readStringJS(length);
}
function readBin(length) {
	return currentUnpackr.copyBuffers ? Uint8Array.prototype.slice.call(src, position$1, position$1 += length) : src.subarray(position$1, position$1 += length);
}
function readExt(length) {
	let type = src[position$1++];
	if (currentExtensions[type]) {
		let end;
		return currentExtensions[type](src.subarray(position$1, end = position$1 += length), (readPosition) => {
			position$1 = readPosition;
			try {
				return read();
			} finally {
				position$1 = end;
			}
		});
	} else throw new Error("Unknown extension type " + type);
}
var keyCache = new Array(4096);
function readKey() {
	let length = src[position$1++];
	if (length >= 160 && length < 192) {
		length = length - 160;
		if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart);
		else if (!(srcStringEnd == 0 && srcEnd < 180)) return readFixedString(length);
	} else {
		position$1--;
		return asSafeString(read());
	}
	let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position$1) : length > 0 ? src[position$1] : 0)) & 4095;
	let entry = keyCache[key];
	let checkPosition = position$1;
	let end = position$1 + length - 3;
	let chunk;
	let i = 0;
	if (entry && entry.bytes == length) {
		while (checkPosition < end) {
			chunk = dataView.getUint32(checkPosition);
			if (chunk != entry[i++]) {
				checkPosition = 1879048192;
				break;
			}
			checkPosition += 4;
		}
		end += 3;
		while (checkPosition < end) {
			chunk = src[checkPosition++];
			if (chunk != entry[i++]) {
				checkPosition = 1879048192;
				break;
			}
		}
		if (checkPosition === end) {
			position$1 = checkPosition;
			return entry.string;
		}
		end -= 3;
		checkPosition = position$1;
	}
	entry = [];
	keyCache[key] = entry;
	entry.bytes = length;
	while (checkPosition < end) {
		chunk = dataView.getUint32(checkPosition);
		entry.push(chunk);
		checkPosition += 4;
	}
	end += 3;
	while (checkPosition < end) {
		chunk = src[checkPosition++];
		entry.push(chunk);
	}
	let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
	if (string != null) return entry.string = string;
	return entry.string = readFixedString(length);
}
function asSafeString(property) {
	if (typeof property === "string") return property;
	if (typeof property === "number" || typeof property === "boolean" || typeof property === "bigint") return property.toString();
	if (property == null) return property + "";
	if (currentUnpackr.allowArraysInMapKeys && Array.isArray(property) && property.flat().every((item) => [
		"string",
		"number",
		"boolean",
		"bigint"
	].includes(typeof item))) return property.flat().toString();
	throw new Error(`Invalid property type for record: ${typeof property}`);
}
var recordDefinition = (id, highByte) => {
	let structure = read().map(asSafeString);
	let firstByte = id;
	if (highByte !== void 0) {
		id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
		structure.highByte = highByte;
	}
	let existingStructure = currentStructures[id];
	if (existingStructure && (existingStructure.isShared || sequentialMode)) (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
	currentStructures[id] = structure;
	structure.read = createStructureReader(structure, firstByte);
	return (structure.read0 || structure.read)();
};
currentExtensions[0] = () => {};
currentExtensions[0].noBuffer = true;
currentExtensions[66] = (data) => {
	let headLength = data.byteLength % 8 || 8;
	let head = BigInt(data[0] & 128 ? data[0] - 256 : data[0]);
	for (let i = 1; i < headLength; i++) {
		head <<= BigInt(8);
		head += BigInt(data[i]);
	}
	if (data.byteLength !== headLength) {
		let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
		let decode = (start, end) => {
			let length = end - start;
			if (length <= 40) {
				let out = view.getBigUint64(start);
				for (let i = start + 8; i < end; i += 8) {
					out <<= BigInt(64);
					out |= view.getBigUint64(i);
				}
				return out;
			}
			let middle = start + (length >> 4 << 3);
			let left = decode(start, middle);
			let right = decode(middle, end);
			return left << BigInt((end - middle) * 8) | right;
		};
		head = head << BigInt((view.byteLength - headLength) * 8) | decode(headLength, view.byteLength);
	}
	return head;
};
var errors = {
	Error,
	EvalError,
	RangeError,
	ReferenceError,
	SyntaxError,
	TypeError,
	URIError,
	AggregateError: typeof AggregateError === "function" ? AggregateError : null
};
currentExtensions[101] = () => {
	let data = read();
	if (!errors[data[0]]) {
		let error = Error(data[1], { cause: data[2] });
		error.name = data[0];
		return error;
	}
	return errors[data[0]](data[1], { cause: data[2] });
};
currentExtensions[105] = (data) => {
	if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
	let id = dataView.getUint32(position$1 - 4);
	if (!referenceMap) referenceMap = /* @__PURE__ */ new Map();
	let token = src[position$1];
	let target;
	if (token >= 144 && token < 160 || token == 220 || token == 221) target = [];
	else if (token >= 128 && token < 144 || token == 222 || token == 223) target = /* @__PURE__ */ new Map();
	else if ((token >= 199 && token <= 201 || token >= 212 && token <= 216) && src[position$1 + 1] === 115) target = /* @__PURE__ */ new Set();
	else target = {};
	let refEntry = { target };
	referenceMap.set(id, refEntry);
	let targetProperties = read();
	if (!refEntry.used) return refEntry.target = targetProperties;
	else Object.assign(target, targetProperties);
	if (target instanceof Map) for (let [k, v] of targetProperties.entries()) target.set(k, v);
	if (target instanceof Set) for (let i of Array.from(targetProperties)) target.add(i);
	return target;
};
currentExtensions[112] = (data) => {
	if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
	let id = dataView.getUint32(position$1 - 4);
	let refEntry = referenceMap.get(id);
	refEntry.used = true;
	return refEntry.target;
};
currentExtensions[115] = () => new Set(read());
var typedArrays = [
	"Int8",
	"Uint8",
	"Uint8Clamped",
	"Int16",
	"Uint16",
	"Int32",
	"Uint32",
	"Float32",
	"Float64",
	"BigInt64",
	"BigUint64"
].map((type) => type + "Array");
var glbl = typeof globalThis === "object" ? globalThis : window;
currentExtensions[116] = (data) => {
	let typeCode = data[0];
	let buffer = Uint8Array.prototype.slice.call(data, 1).buffer;
	let typedArrayName = typedArrays[typeCode];
	if (!typedArrayName) {
		if (typeCode === 16) return buffer;
		if (typeCode === 17) return new DataView(buffer);
		throw new Error("Could not find typed array for code " + typeCode);
	}
	return new glbl[typedArrayName](buffer);
};
currentExtensions[120] = () => {
	let data = read();
	return new RegExp(data[0], data[1]);
};
var TEMP_BUNDLE = [];
currentExtensions[98] = (data) => {
	let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
	let dataPosition = position$1;
	position$1 += dataSize - data.length;
	bundledStrings$1 = TEMP_BUNDLE;
	bundledStrings$1 = [readOnlyJSString(), readOnlyJSString()];
	bundledStrings$1.position0 = 0;
	bundledStrings$1.position1 = 0;
	bundledStrings$1.postBundlePosition = position$1;
	position$1 = dataPosition;
	return read();
};
currentExtensions[255] = (data) => {
	if (data.length == 4) return /* @__PURE__ */ new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
	else if (data.length == 8) return /* @__PURE__ */ new Date(((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3);
	else if (data.length == 12) return /* @__PURE__ */ new Date(((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3);
	else return /* @__PURE__ */ new Date("invalid");
};
function saveState(callback) {
	if (currentUnpackr && currentUnpackr._onSaveState) currentUnpackr._onSaveState();
	let savedSrcEnd = srcEnd;
	let savedPosition = position$1;
	let savedStringPosition = stringPosition;
	let savedSrcStringStart = srcStringStart;
	let savedSrcStringEnd = srcStringEnd;
	let savedSrcString = srcString;
	let savedStrings = strings;
	let savedReferenceMap = referenceMap;
	let savedBundledStrings = bundledStrings$1;
	let savedSrc = new Uint8Array(src.slice(0, srcEnd));
	let savedStructures = currentStructures;
	let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
	let savedPackr = currentUnpackr;
	let savedSequentialMode = sequentialMode;
	let value = callback();
	srcEnd = savedSrcEnd;
	position$1 = savedPosition;
	stringPosition = savedStringPosition;
	srcStringStart = savedSrcStringStart;
	srcStringEnd = savedSrcStringEnd;
	srcString = savedSrcString;
	strings = savedStrings;
	referenceMap = savedReferenceMap;
	bundledStrings$1 = savedBundledStrings;
	src = savedSrc;
	sequentialMode = savedSequentialMode;
	currentStructures = savedStructures;
	currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
	currentUnpackr = savedPackr;
	dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
	return value;
}
function clearSource() {
	src = null;
	referenceMap = null;
	currentStructures = null;
}
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) mult10[i] = +("1e" + Math.floor(45.15 - i * .30103));
var defaultUnpackr = new Unpackr({ useRecords: false });
var unpack = defaultUnpackr.unpack;
defaultUnpackr.unpackMultiple;
defaultUnpackr.unpack;
var FLOAT32_OPTIONS = {
	NEVER: 0,
	ALWAYS: 1,
	DECIMAL_ROUND: 3,
	DECIMAL_FIT: 4
};
new Uint8Array((/* @__PURE__ */ new Float32Array(1)).buffer, 0, 4);
Unpackr.SUPPORTS_STRUCT_HOOKS = true;
//#endregion
//#region node_modules/.pnpm/msgpackr@2.0.4/node_modules/msgpackr/pack.js
var textEncoder;
try {
	textEncoder = new TextEncoder();
} catch (error) {}
var extensions;
var extensionClasses;
var hasNodeBuffer = typeof Buffer !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? function(length) {
	return Buffer.allocUnsafeSlow(length);
} : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var target;
var keysTarget;
var targetView;
var position = 0;
var safeEnd;
var bundledStrings = null;
var MAX_BUNDLE_SIZE = 21760;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");
var Packr = class extends Unpackr {
	constructor(options) {
		super(options);
		this.offset = 0;
		let start;
		let hasSharedUpdate;
		let structures;
		let referenceMap;
		let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position) {
			return target.utf8Write(string, position, target.byteLength - position);
		} : textEncoder && textEncoder.encodeInto ? function(string, position) {
			return textEncoder.encodeInto(string, target.subarray(position)).written;
		} : false;
		let packr = this;
		if (!options) options = {};
		let isSequential = options && options.sequential;
		let hasSharedStructures = options.structures || options.saveStructures;
		let maxSharedStructures = options.maxSharedStructures;
		if (maxSharedStructures == null) maxSharedStructures = hasSharedStructures ? 32 : 0;
		if (maxSharedStructures > 8160) throw new Error("Maximum maxSharedStructure is 8160");
		if (options.structuredClone && options.moreTypes == void 0) this.moreTypes = true;
		let maxOwnStructures = options.maxOwnStructures;
		if (maxOwnStructures == null) maxOwnStructures = hasSharedStructures ? 32 : 64;
		if (!this.structures && options.useRecords != false) this.structures = [];
		let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
		let sharedLimitId = maxSharedStructures + 64;
		let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
		if (maxStructureId > 8256) throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
		let recordIdsToRemove = [];
		let transitionsCount = 0;
		let serializationsSinceTransitionRebuild = 0;
		this.pack = this.encode = function(value, encodeOptions) {
			if (!target) {
				target = new ByteArrayAllocate(8192);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
				position = 0;
			}
			safeEnd = target.length - 10;
			if (safeEnd - position < 2048) {
				target = new ByteArrayAllocate(target.length);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
				safeEnd = target.length - 10;
				position = 0;
			} else position = position + 7 & 2147483640;
			start = position;
			if (encodeOptions & 2048) position += encodeOptions & 255;
			referenceMap = packr.structuredClone ? /* @__PURE__ */ new Map() : null;
			if (packr.bundleStrings && typeof value !== "string") {
				bundledStrings = [];
				bundledStrings.size = Infinity;
			} else bundledStrings = null;
			structures = packr.structures;
			if (structures) {
				if (structures.uninitialized) structures = packr._mergeStructures(packr.getStructures());
				let sharedLength = structures.sharedLength || 0;
				if (sharedLength > maxSharedStructures) throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
				if (!structures.transitions) {
					structures.transitions = Object.create(null);
					for (let i = 0; i < sharedLength; i++) {
						let keys = structures[i];
						if (!keys) continue;
						let nextTransition, transition = structures.transitions;
						for (let j = 0, l = keys.length; j < l; j++) {
							let key = keys[j];
							nextTransition = transition[key];
							if (!nextTransition) nextTransition = transition[key] = Object.create(null);
							transition = nextTransition;
						}
						transition[RECORD_SYMBOL] = i + 64;
					}
					this.lastNamedStructuresLength = sharedLength;
				}
				if (!isSequential) structures.nextId = sharedLength + 64;
			}
			if (hasSharedUpdate) hasSharedUpdate = false;
			let encodingError;
			try {
				if (packr._writeStruct && value && typeof value === "object") {
					if (value.constructor === Object) writeStruct(value);
					else if (value.constructor !== Map && !Array.isArray(value) && !extensionClasses.some((extClass) => value instanceof extClass)) writeStruct(value.toJSON ? value.toJSON() : value);
					else pack(value);
				} else pack(value);
				let lastBundle = bundledStrings;
				if (bundledStrings) writeBundles(start, pack, 0);
				if (referenceMap && referenceMap.idsToInsert) {
					let idsToInsert = referenceMap.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
					let i = idsToInsert.length;
					let incrementPosition = -1;
					while (lastBundle && i > 0) {
						let insertionPoint = idsToInsert[--i].offset + start;
						if (insertionPoint < lastBundle.stringsPosition + start && incrementPosition === -1) incrementPosition = 0;
						if (insertionPoint > lastBundle.position + start) {
							if (incrementPosition >= 0) incrementPosition += 6;
						} else {
							if (incrementPosition >= 0) {
								targetView.setUint32(lastBundle.position + start, targetView.getUint32(lastBundle.position + start) + incrementPosition);
								incrementPosition = -1;
							}
							lastBundle = lastBundle.previous;
							i++;
						}
					}
					if (incrementPosition >= 0 && lastBundle) targetView.setUint32(lastBundle.position + start, targetView.getUint32(lastBundle.position + start) + incrementPosition);
					position += idsToInsert.length * 6;
					if (position > safeEnd) makeRoom(position);
					packr.offset = position;
					let serialized = insertIds(target.subarray(start, position), idsToInsert);
					referenceMap = null;
					return serialized;
				}
				packr.offset = position;
				if (encodeOptions & 512) {
					target.start = start;
					target.end = position;
					return target;
				}
				return target.subarray(start, position);
			} catch (error) {
				encodingError = error;
				throw error;
			} finally {
				if (structures) {
					resetStructures();
					if (hasSharedUpdate && packr.saveStructures) {
						let sharedLength = structures.sharedLength || 0;
						let returnBuffer = target.subarray(start, position);
						let newSharedData = (packr._prepareStructures || prepareStructures)(structures, packr);
						if (!encodingError) {
							if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
								structures.uninitialized = true;
								return packr.pack(value, encodeOptions);
							}
							packr.lastNamedStructuresLength = sharedLength;
							if (target.length > 1073741824) target = null;
							return returnBuffer;
						}
					}
				}
				if (target.length > 1073741824) target = null;
				if (encodeOptions & 1024) position = start;
			}
		};
		const resetStructures = () => {
			if (serializationsSinceTransitionRebuild < 10) serializationsSinceTransitionRebuild++;
			let sharedLength = structures.sharedLength || 0;
			if (structures.length > sharedLength && !isSequential) structures.length = sharedLength;
			if (transitionsCount > 1e4) {
				structures.transitions = null;
				serializationsSinceTransitionRebuild = 0;
				transitionsCount = 0;
				if (recordIdsToRemove.length > 0) recordIdsToRemove = [];
			} else if (recordIdsToRemove.length > 0 && !isSequential) {
				for (let i = 0, l = recordIdsToRemove.length; i < l; i++) recordIdsToRemove[i][RECORD_SYMBOL] = 0;
				recordIdsToRemove = [];
			}
		};
		const packArray = (value) => {
			var length = value.length;
			if (length < 16) target[position++] = 144 | length;
			else if (length < 65536) {
				target[position++] = 220;
				target[position++] = length >> 8;
				target[position++] = length & 255;
			} else {
				target[position++] = 221;
				targetView.setUint32(position, length);
				position += 4;
			}
			for (let i = 0; i < length; i++) pack(value[i]);
		};
		const pack = (value) => {
			if (position > safeEnd) target = makeRoom(position);
			var type = typeof value;
			var length;
			if (type === "string") {
				let strLength = value.length;
				if (bundledStrings && strLength >= 4 && strLength < 4096) {
					if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
						let extStart;
						let maxBytes = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
						if (position + maxBytes > safeEnd) target = makeRoom(position + maxBytes);
						let lastBundle;
						if (bundledStrings.position) {
							lastBundle = bundledStrings;
							target[position] = 200;
							position += 3;
							target[position++] = 98;
							extStart = position - start;
							position += 4;
							writeBundles(start, pack, 0);
							targetView.setUint16(extStart + start - 3, position - start - extStart);
						} else {
							target[position++] = 214;
							target[position++] = 98;
							extStart = position - start;
							position += 4;
						}
						bundledStrings = ["", ""];
						bundledStrings.previous = lastBundle;
						bundledStrings.size = 0;
						bundledStrings.position = extStart;
					}
					let twoByte = hasNonLatin.test(value);
					bundledStrings[twoByte ? 0 : 1] += value;
					target[position++] = 193;
					pack(twoByte ? -strLength : strLength);
					return;
				}
				let headerSize;
				if (strLength < 32) headerSize = 1;
				else if (strLength < 256) headerSize = 2;
				else if (strLength < 65536) headerSize = 3;
				else headerSize = 5;
				let maxBytes = strLength * 3;
				if (position + maxBytes > safeEnd) target = makeRoom(position + maxBytes);
				if (strLength < 64 || !encodeUtf8) {
					let i, c1, c2, strPosition = position + headerSize;
					for (i = 0; i < strLength; i++) {
						c1 = value.charCodeAt(i);
						if (c1 < 128) target[strPosition++] = c1;
						else if (c1 < 2048) {
							target[strPosition++] = c1 >> 6 | 192;
							target[strPosition++] = c1 & 63 | 128;
						} else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
							c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
							i++;
							target[strPosition++] = c1 >> 18 | 240;
							target[strPosition++] = c1 >> 12 & 63 | 128;
							target[strPosition++] = c1 >> 6 & 63 | 128;
							target[strPosition++] = c1 & 63 | 128;
						} else {
							target[strPosition++] = c1 >> 12 | 224;
							target[strPosition++] = c1 >> 6 & 63 | 128;
							target[strPosition++] = c1 & 63 | 128;
						}
					}
					length = strPosition - position - headerSize;
				} else length = encodeUtf8(value, position + headerSize);
				if (length < 32) target[position++] = 160 | length;
				else if (length < 256) {
					if (headerSize < 2) target.copyWithin(position + 2, position + 1, position + 1 + length);
					target[position++] = 217;
					target[position++] = length;
				} else if (length < 65536) {
					if (headerSize < 3) target.copyWithin(position + 3, position + 2, position + 2 + length);
					target[position++] = 218;
					target[position++] = length >> 8;
					target[position++] = length & 255;
				} else {
					if (headerSize < 5) target.copyWithin(position + 5, position + 3, position + 3 + length);
					target[position++] = 219;
					targetView.setUint32(position, length);
					position += 4;
				}
				position += length;
			} else if (type === "number") {
				if (value >>> 0 === value) {
					if (value < 32 || value < 128 && this.useRecords === false || value < 64 && !this._writeStruct) target[position++] = value;
					else if (value < 256) {
						target[position++] = 204;
						target[position++] = value;
					} else if (value < 65536) {
						target[position++] = 205;
						target[position++] = value >> 8;
						target[position++] = value & 255;
					} else {
						target[position++] = 206;
						targetView.setUint32(position, value);
						position += 4;
					}
				} else if (value >> 0 === value) {
					if (value >= -32) target[position++] = 256 + value;
					else if (value >= -128) {
						target[position++] = 208;
						target[position++] = value + 256;
					} else if (value >= -32768) {
						target[position++] = 209;
						targetView.setInt16(position, value);
						position += 2;
					} else {
						target[position++] = 210;
						targetView.setInt32(position, value);
						position += 4;
					}
				} else {
					let useFloat32;
					if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
						target[position++] = 202;
						targetView.setFloat32(position, value);
						let xShifted;
						if (useFloat32 < 4 || (xShifted = value * mult10[(target[position] & 127) << 1 | target[position + 1] >> 7]) >> 0 === xShifted) {
							position += 4;
							return;
						} else position--;
					}
					target[position++] = 203;
					targetView.setFloat64(position, value);
					position += 8;
				}
			} else if (type === "object" || type === "function") {
				if (!value) target[position++] = 192;
				else {
					if (referenceMap) {
						let referee = referenceMap.get(value);
						if (referee) {
							if (!referee.id) referee.id = (referenceMap.idsToInsert || (referenceMap.idsToInsert = [])).push(referee);
							target[position++] = 214;
							target[position++] = 112;
							targetView.setUint32(position, referee.id);
							position += 4;
							return;
						} else referenceMap.set(value, { offset: position - start });
					}
					let constructor = value.constructor;
					if (constructor === Object) writeObject(value);
					else if (constructor === Array) packArray(value);
					else if (constructor === Map) {
						if (this.mapAsEmptyObject) target[position++] = 128;
						else {
							length = value.size;
							if (length < 16) target[position++] = 128 | length;
							else if (length < 65536) {
								target[position++] = 222;
								target[position++] = length >> 8;
								target[position++] = length & 255;
							} else {
								target[position++] = 223;
								targetView.setUint32(position, length);
								position += 4;
							}
							for (let [key, entryValue] of value) {
								pack(key);
								pack(entryValue);
							}
						}
					} else {
						for (let i = 0, l = extensions.length; i < l; i++) {
							let extensionClass = extensionClasses[i];
							if (value instanceof extensionClass) {
								let extension = extensions[i];
								if (extension.write) {
									if (extension.type) {
										target[position++] = 212;
										target[position++] = extension.type;
										target[position++] = 0;
									}
									let writeResult = extension.write.call(this, value);
									if (writeResult === value) {
										if (Array.isArray(value)) packArray(value);
										else writeObject(value);
									} else pack(writeResult);
									return;
								}
								let currentTarget = target;
								let currentTargetView = targetView;
								let currentPosition = position;
								target = null;
								let result;
								try {
									result = extension.pack.call(this, value, (size) => {
										target = currentTarget;
										currentTarget = null;
										position += size;
										if (position > safeEnd) makeRoom(position);
										return {
											target,
											targetView,
											position: position - size
										};
									}, pack);
								} finally {
									if (currentTarget) {
										target = currentTarget;
										targetView = currentTargetView;
										position = currentPosition;
										safeEnd = target.length - 10;
									}
								}
								if (result) {
									if (result.length + position > safeEnd) makeRoom(result.length + position);
									position = writeExtensionData(result, target, position, extension.type);
								}
								return;
							}
						}
						if (Array.isArray(value)) packArray(value);
						else {
							if (value.toJSON) {
								const json = value.toJSON();
								if (json !== value) return pack(json);
							}
							if (type === "function") return pack(this.writeFunction && this.writeFunction(value));
							writeObject(value);
						}
					}
				}
			} else if (type === "boolean") target[position++] = value ? 195 : 194;
			else if (type === "bigint") {
				if (value < 0x8000000000000000 && value >= -0x8000000000000000) {
					target[position++] = 211;
					targetView.setBigInt64(position, value);
				} else if (value < 0x10000000000000000 && value > 0) {
					target[position++] = 207;
					targetView.setBigUint64(position, value);
				} else if (this.largeBigIntToFloat) {
					target[position++] = 203;
					targetView.setFloat64(position, Number(value));
				} else if (this.largeBigIntToString) return pack(value.toString());
				else if (this.useBigIntExtension || this.moreTypes) {
					let empty = value < 0 ? BigInt(-1) : BigInt(0);
					let array;
					if (value >> BigInt(65536) === empty) {
						let mask = BigInt(0x10000000000000000) - BigInt(1);
						let chunks = [];
						while (true) {
							chunks.push(value & mask);
							if (value >> BigInt(63) === empty) break;
							value >>= BigInt(64);
						}
						array = new Uint8Array(new BigUint64Array(chunks).buffer);
						array.reverse();
					} else {
						let invert = value < 0;
						let string = (invert ? ~value : value).toString(16);
						if (string.length % 2) string = "0" + string;
						else if (parseInt(string.charAt(0), 16) >= 8) string = "00" + string;
						if (hasNodeBuffer) array = Buffer.from(string, "hex");
						else {
							array = new Uint8Array(string.length / 2);
							for (let i = 0; i < array.length; i++) array[i] = parseInt(string.slice(i * 2, i * 2 + 2), 16);
						}
						if (invert) for (let i = 0; i < array.length; i++) array[i] = ~array[i];
					}
					if (array.length + position > safeEnd) makeRoom(array.length + position);
					position = writeExtensionData(array, target, position, 66);
					return;
				} else throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");
				position += 8;
			} else if (type === "undefined") {
				if (this.encodeUndefinedAsNil) target[position++] = 192;
				else {
					target[position++] = 212;
					target[position++] = 0;
					target[position++] = 0;
				}
			} else throw new Error("Unknown type: " + type);
		};
		const writePlainObject = this.variableMapSize || this.coercibleKeyAsNumber || this.skipValues ? (object) => {
			let keys;
			if (this.skipValues) {
				keys = [];
				for (let key in object) if ((typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) && !this.skipValues.includes(object[key])) keys.push(key);
			} else keys = Object.keys(object);
			let length = keys.length;
			if (length < 16) target[position++] = 128 | length;
			else if (length < 65536) {
				target[position++] = 222;
				target[position++] = length >> 8;
				target[position++] = length & 255;
			} else {
				target[position++] = 223;
				targetView.setUint32(position, length);
				position += 4;
			}
			let key;
			if (this.coercibleKeyAsNumber) for (let i = 0; i < length; i++) {
				key = keys[i];
				let num = Number(key);
				pack(isNaN(num) ? key : num);
				pack(object[key]);
			}
			else for (let i = 0; i < length; i++) {
				pack(key = keys[i]);
				pack(object[key]);
			}
		} : (object) => {
			target[position++] = 222;
			let objectOffset = position - start;
			position += 2;
			let size = 0;
			for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
				pack(key);
				pack(object[key]);
				size++;
			}
			if (size > 65535) throw new Error("Object is too large to serialize with fast 16-bit map size, use the \"variableMapSize\" option to serialize this object");
			target[objectOffset++ + start] = size >> 8;
			target[objectOffset + start] = size & 255;
		};
		const writeRecord = this.useRecords === false ? writePlainObject : options.progressiveRecords && !useTwoByteRecords ? (object) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let objectOffset = position++ - start;
			let wroteKeys;
			for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
				nextTransition = transition[key];
				if (nextTransition) transition = nextTransition;
				else {
					let keys = Object.keys(object);
					let lastTransition = transition;
					transition = structures.transitions;
					let newTransitions = 0;
					for (let i = 0, l = keys.length; i < l; i++) {
						let key = keys[i];
						nextTransition = transition[key];
						if (!nextTransition) {
							nextTransition = transition[key] = Object.create(null);
							newTransitions++;
						}
						transition = nextTransition;
					}
					if (objectOffset + start + 1 == position) {
						position--;
						newRecord(transition, keys, newTransitions);
					} else insertNewRecord(transition, keys, objectOffset, newTransitions);
					wroteKeys = true;
					transition = lastTransition[key];
				}
				pack(object[key]);
			}
			if (!wroteKeys) {
				let recordId = transition[RECORD_SYMBOL];
				if (recordId) target[objectOffset + start] = recordId;
				else insertNewRecord(transition, Object.keys(object), objectOffset, 0);
			}
		} : (object) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let newTransitions = 0;
			for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
				nextTransition = transition[key];
				if (!nextTransition) {
					nextTransition = transition[key] = Object.create(null);
					newTransitions++;
				}
				transition = nextTransition;
			}
			let recordId = transition[RECORD_SYMBOL];
			if (recordId) {
				if (recordId >= 96 && useTwoByteRecords) {
					target[position++] = ((recordId -= 96) & 31) + 96;
					target[position++] = recordId >> 5;
				} else target[position++] = recordId;
			} else newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
			for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) pack(object[key]);
		};
		const checkUseRecords = typeof this.useRecords == "function" && this.useRecords;
		const writeObject = checkUseRecords ? (object) => {
			checkUseRecords(object) ? writeRecord(object) : writePlainObject(object);
		} : writeRecord;
		const writeStruct = (object) => {
			let newPosition = packr._writeStruct(object, target, start, position, structures, makeRoom, (value, newPosition, notifySharedUpdate) => {
				if (notifySharedUpdate) return hasSharedUpdate = true;
				position = newPosition;
				let startTarget = target;
				pack(value);
				resetStructures();
				if (startTarget !== target) return {
					position,
					targetView,
					target
				};
				return position;
			});
			if (newPosition === 0) return writeObject(object);
			position = newPosition;
		};
		const makeRoom = (end) => {
			let newSize;
			if (end > 16777216) {
				if (end - start > MAX_BUFFER_SIZE) throw new Error("Packed buffer would be larger than maximum buffer size");
				newSize = Math.min(MAX_BUFFER_SIZE, Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096);
			} else newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
			let newBuffer = new ByteArrayAllocate(newSize);
			targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
			end = Math.min(end, target.length);
			if (target.copy) target.copy(newBuffer, 0, start, end);
			else newBuffer.set(target.slice(start, end));
			position -= start;
			start = 0;
			safeEnd = newBuffer.length - 10;
			return target = newBuffer;
		};
		const newRecord = (transition, keys, newTransitions) => {
			let recordId = structures.nextId;
			if (!recordId) recordId = 64;
			if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
				recordId = structures.nextOwnId;
				if (!(recordId < maxStructureId)) recordId = sharedLimitId;
				structures.nextOwnId = recordId + 1;
			} else {
				if (recordId >= maxStructureId) recordId = sharedLimitId;
				structures.nextId = recordId + 1;
			}
			let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
			transition[RECORD_SYMBOL] = recordId;
			transition.__keys__ = keys;
			structures[recordId - 64] = keys;
			if (recordId < sharedLimitId) {
				keys.isShared = true;
				structures.sharedLength = recordId - 63;
				hasSharedUpdate = true;
				if (highByte >= 0) {
					target[position++] = (recordId & 31) + 96;
					target[position++] = highByte;
				} else target[position++] = recordId;
			} else {
				if (highByte >= 0) {
					target[position++] = 213;
					target[position++] = 114;
					target[position++] = (recordId & 31) + 96;
					target[position++] = highByte;
				} else {
					target[position++] = 212;
					target[position++] = 114;
					target[position++] = recordId;
				}
				if (newTransitions) transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
				if (recordIdsToRemove.length >= maxOwnStructures) recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
				recordIdsToRemove.push(transition);
				pack(keys);
			}
		};
		const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
			let mainTarget = target;
			let mainPosition = position;
			let mainSafeEnd = safeEnd;
			let mainStart = start;
			target = keysTarget;
			position = 0;
			start = 0;
			if (!target) keysTarget = target = new ByteArrayAllocate(8192);
			safeEnd = target.length - 10;
			newRecord(transition, keys, newTransitions);
			keysTarget = target;
			let keysPosition = position;
			target = mainTarget;
			position = mainPosition;
			safeEnd = mainSafeEnd;
			start = mainStart;
			if (keysPosition > 1) {
				let newEnd = position + keysPosition - 1;
				if (newEnd > safeEnd) makeRoom(newEnd);
				let insertionPosition = insertionOffset + start;
				target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
				target.set(keysTarget.slice(0, keysPosition), insertionPosition);
				position = newEnd;
			} else target[insertionOffset + start] = keysTarget[0];
		};
	}
	useBuffer(buffer) {
		target = buffer;
		target.dataView || (target.dataView = new DataView(target.buffer, target.byteOffset, target.byteLength));
		targetView = target.dataView;
		position = 0;
	}
	set position(value) {
		position = value;
	}
	get position() {
		return position;
	}
	clearSharedData() {
		if (this.structures) this.structures = [];
		if (this.typedStructs) this.typedStructs = [];
	}
};
extensionClasses = [
	Date,
	Set,
	Error,
	RegExp,
	ArrayBuffer,
	Object.getPrototypeOf(Uint8Array.prototype).constructor,
	DataView,
	C1Type
];
extensions = [
	{ pack(date, allocateForWrite, pack) {
		let seconds = date.getTime() / 1e3;
		if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
			let { target, targetView, position } = allocateForWrite(6);
			target[position++] = 214;
			target[position++] = 255;
			targetView.setUint32(position, seconds);
		} else if (seconds > 0 && seconds < 4294967296) {
			let { target, targetView, position } = allocateForWrite(10);
			target[position++] = 215;
			target[position++] = 255;
			targetView.setUint32(position, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
			targetView.setUint32(position + 4, seconds);
		} else if (isNaN(seconds)) {
			if (this.onInvalidDate) {
				allocateForWrite(0);
				return pack(this.onInvalidDate());
			}
			let { target, targetView, position } = allocateForWrite(3);
			target[position++] = 212;
			target[position++] = 255;
			target[position++] = 255;
		} else {
			let { target, targetView, position } = allocateForWrite(15);
			target[position++] = 199;
			target[position++] = 12;
			target[position++] = 255;
			targetView.setUint32(position, date.getMilliseconds() * 1e6);
			targetView.setBigInt64(position + 4, BigInt(Math.floor(seconds)));
		}
	} },
	{ pack(set, allocateForWrite, pack) {
		if (this.setAsEmptyObject) {
			allocateForWrite(0);
			return pack({});
		}
		let array = Array.from(set);
		let { target, position } = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 212;
			target[position++] = 115;
			target[position++] = 0;
		}
		pack(array);
	} },
	{ pack(error, allocateForWrite, pack) {
		let { target, position } = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 212;
			target[position++] = 101;
			target[position++] = 0;
		}
		pack([
			error.name,
			error.message,
			error.cause
		]);
	} },
	{ pack(regex, allocateForWrite, pack) {
		let { target, position } = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 212;
			target[position++] = 120;
			target[position++] = 0;
		}
		pack([regex.source, regex.flags]);
	} },
	{ pack(arrayBuffer, allocateForWrite) {
		if (this.moreTypes) writeExtBuffer(arrayBuffer, 16, allocateForWrite);
		else writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
	} },
	{ pack(typedArray, allocateForWrite) {
		let constructor = typedArray.constructor;
		if (constructor !== ByteArray && this.moreTypes) writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
		else writeBuffer(typedArray, allocateForWrite);
	} },
	{ pack(arrayBuffer, allocateForWrite) {
		if (this.moreTypes) writeExtBuffer(arrayBuffer, 17, allocateForWrite);
		else writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
	} },
	{ pack(c1, allocateForWrite) {
		let { target, position } = allocateForWrite(1);
		target[position] = 193;
	} }
];
function writeExtBuffer(typedArray, type, allocateForWrite, encode) {
	let length = typedArray.byteLength;
	if (length + 1 < 256) {
		var { target, position } = allocateForWrite(4 + length);
		target[position++] = 199;
		target[position++] = length + 1;
	} else if (length + 1 < 65536) {
		var { target, position } = allocateForWrite(5 + length);
		target[position++] = 200;
		target[position++] = length + 1 >> 8;
		target[position++] = length + 1 & 255;
	} else {
		var { target, position, targetView } = allocateForWrite(7 + length);
		target[position++] = 201;
		targetView.setUint32(position, length + 1);
		position += 4;
	}
	target[position++] = 116;
	target[position++] = type;
	if (!typedArray.buffer) typedArray = new Uint8Array(typedArray);
	target.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position);
}
function writeBuffer(buffer, allocateForWrite) {
	let length = buffer.byteLength;
	var target, position;
	if (length < 256) {
		var { target, position } = allocateForWrite(length + 2);
		target[position++] = 196;
		target[position++] = length;
	} else if (length < 65536) {
		var { target, position } = allocateForWrite(length + 3);
		target[position++] = 197;
		target[position++] = length >> 8;
		target[position++] = length & 255;
	} else {
		var { target, position, targetView } = allocateForWrite(length + 5);
		target[position++] = 198;
		targetView.setUint32(position, length);
		position += 4;
	}
	target.set(buffer, position);
}
function writeExtensionData(result, target, position, type) {
	let length = result.length;
	switch (length) {
		case 1:
			target[position++] = 212;
			break;
		case 2:
			target[position++] = 213;
			break;
		case 4:
			target[position++] = 214;
			break;
		case 8:
			target[position++] = 215;
			break;
		case 16:
			target[position++] = 216;
			break;
		default: if (length < 256) {
			target[position++] = 199;
			target[position++] = length;
		} else if (length < 65536) {
			target[position++] = 200;
			target[position++] = length >> 8;
			target[position++] = length & 255;
		} else {
			target[position++] = 201;
			target[position++] = length >> 24;
			target[position++] = length >> 16 & 255;
			target[position++] = length >> 8 & 255;
			target[position++] = length & 255;
		}
	}
	target[position++] = type;
	target.set(result, position);
	position += length;
	return position;
}
function insertIds(serialized, idsToInsert) {
	let nextId;
	let distanceToMove = idsToInsert.length * 6;
	let lastEnd = serialized.length - distanceToMove;
	while (nextId = idsToInsert.pop()) {
		let offset = nextId.offset;
		let id = nextId.id;
		serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
		distanceToMove -= 6;
		let position = offset + distanceToMove;
		serialized[position++] = 214;
		serialized[position++] = 105;
		serialized[position++] = id >> 24;
		serialized[position++] = id >> 16 & 255;
		serialized[position++] = id >> 8 & 255;
		serialized[position++] = id & 255;
		lastEnd = offset;
	}
	return serialized;
}
function writeBundles(start, pack, incrementPosition) {
	if (bundledStrings.length > 0) {
		targetView.setUint32(bundledStrings.position + start, position + incrementPosition - bundledStrings.position - start);
		bundledStrings.stringsPosition = position - start;
		let writeStrings = bundledStrings;
		bundledStrings = null;
		pack(writeStrings[0]);
		pack(writeStrings[1]);
	}
}
function prepareStructures(structures, packr) {
	structures.isCompatible = (existingStructures) => {
		let compatible = !existingStructures || (packr.lastNamedStructuresLength || 0) === existingStructures.length;
		if (!compatible) packr._mergeStructures(existingStructures);
		return compatible;
	};
	return structures;
}
Packr.SUPPORTS_STRUCT_HOOKS = true;
var defaultPackr = new Packr({ useRecords: false });
defaultPackr.pack;
defaultPackr.pack;
var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
var QUALIFYING_SCORE = 1e6;
//#endregion
//#region src/modules/leaderboard/notes-hash.ts
/**
* sha-256 over the packed notes bytes concatenated with the score.
*
* This is integrity, not authenticity: it stops someone editing the score field of a captured
* request, but anyone reading the bundle can compute a valid hash for a fabricated record. See the
* "Abuse Posture" section of the design doc.
*
* Both the client and the Worker call this, so the byte layout must stay identical on both sides —
* the score is stringified as an integer.
*/
async function computeNotesHash(notes, score) {
	const scoreBytes = new TextEncoder().encode(String(Math.round(score)));
	const payload = new Uint8Array(notes.byteLength + scoreBytes.byteLength);
	payload.set(notes, 0);
	payload.set(scoreBytes, notes.byteLength);
	const digest = await crypto.subtle.digest("SHA-256", payload);
	return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region src/modules/leaderboard/notes-payload.ts
var PRECISION_SCALE = 100;
function decodeNotesPayload(payload) {
	const records = unpack(payload);
	const decoded = [];
	let timestamp = 0;
	let frequency = 0;
	for (const record of records) {
		const [timestampDelta, frequencyDelta] = typeof record === "number" ? [record, 0] : record;
		timestamp += timestampDelta;
		frequency += frequencyDelta;
		decoded.push({
			timestamp: timestamp / PRECISION_SCALE,
			frequency: frequency / PRECISION_SCALE
		});
	}
	return decoded;
}
//#endregion
//#region src/modules/leaderboard/types.ts
var BOARD_KV_KEY = "board:v1";
//#endregion
//#region worker/leaderboard.ts
/** Single global board — every submission and every read goes through one Durable Object. */
var BOARD_INSTANCE_NAME = "board";
var EMPTY_BOARD = {
	generatedAt: 0,
	entries: []
};
/**
* One cache entry for the board, whatever query string the caller used. Keying on the raw request
* would let `/leaderboard?x=1` occupy its own entry that no purge ever reaches — and bypass the
* cache into KV on every distinct string.
*/
var boardCacheKey = (request) => new URL("/leaderboard", request.url).toString();
var jsonHeaders = { "Content-Type": "application/json" };
var error = (status, message) => new Response(JSON.stringify({ error: message }), {
	status,
	headers: jsonHeaders
});
var getBoardStub = (env) => {
	const namespace = env.LEADERBOARD_BOARD;
	if (!namespace) return null;
	return namespace.get(namespace.idFromName(BOARD_INSTANCE_NAME));
};
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var isBoundedString = (value, maxLength) => isNonEmptyString(value) && value.length <= maxLength;
/** ISO-3166 alpha-2, which is all the client ever sends. */
var isCountryCode = (value) => typeof value === "string" && /^[a-z]{2}$/.test(value);
/**
* Shape and bounds checks on a decoded submission. Everything here is cheap and synchronous; the
* hash recomputation is done separately because it is not.
*/
var validateSubmission = (payload) => {
	if (!payload || typeof payload !== "object") return { message: "Invalid payload" };
	const submission = payload;
	if (!isBoundedString(submission.clientId, 128) || !isBoundedString(submission.songId, 128) || !isBoundedString(submission.name, 40) || !isBoundedString(submission.artist, 200) || !isBoundedString(submission.title, 200) || !isBoundedString(submission.mode, 128) || !isBoundedString(submission.notesHash, 128) || !Number.isFinite(submission.tolerance) || !Number.isFinite(submission.trackIndex) || !Number.isFinite(submission.inputLag)) return { message: "Invalid payload" };
	if (submission.country !== null && !isCountryCode(submission.country)) return { message: "Invalid country" };
	if (submission.songLastUpdate !== null && submission.songLastUpdate !== void 0 && !isBoundedString(submission.songLastUpdate, 200)) return { message: "Invalid songLastUpdate" };
	if (!Number.isInteger(submission.score)) return { message: "Invalid score" };
	if (submission.score < QUALIFYING_SCORE || submission.score > 35e5) return { message: "Score out of range" };
	if (!Number.isInteger(submission.tolerance) || submission.tolerance < 1 || submission.tolerance > 2) return { message: "Difficulty not eligible" };
	if (!(submission.notes instanceof Uint8Array) || submission.notes.byteLength === 0) return { message: "Missing notes" };
	let recordCount;
	try {
		recordCount = decodeNotesPayload(submission.notes).length;
	} catch {
		return { message: "Malformed notes" };
	}
	if (recordCount < 100 || recordCount > 2e5) return { message: "Implausible notes" };
	return { submission: {
		...submission,
		songLastUpdate: submission.songLastUpdate ?? null
	} };
};
var handleLeaderboardSubmit = async (request, env) => {
	if (request.method !== "POST") return error(405, "Method not allowed");
	const board = getBoardStub(env);
	if (!board) return error(500, "Leaderboard storage is not configured");
	const body = new Uint8Array(await request.arrayBuffer());
	if (body.byteLength > 262144) return error(413, "Payload too large");
	let decoded;
	try {
		decoded = unpack(body);
	} catch {
		return error(400, "Malformed body");
	}
	const validated = validateSubmission(decoded);
	if ("message" in validated) return error(400, validated.message);
	const { submission } = validated;
	if (await computeNotesHash(submission.notes, submission.score) !== submission.notesHash) return error(400, "Notes hash mismatch");
	const rateLimit = await env.LEADERBOARD_RATE_LIMITER?.limit({ key: submission.clientId });
	if (rateLimit && !rateLimit.success) return error(429, "Too many requests");
	const result = await board.submit(submission, submission.notes);
	if (result.accepted) await caches.default.delete(boardCacheKey(request));
	return new Response(JSON.stringify(result), { headers: jsonHeaders });
};
var handleLeaderboardRead = async (request, env) => {
	if (request.method !== "GET") return error(405, "Method not allowed");
	const cache = caches.default;
	const cacheKey = boardCacheKey(request);
	const cached = await cache.match(cacheKey);
	if (cached) return cached;
	const stored = await env.LEADERBOARD_KV?.get("board:v1") ?? JSON.stringify(EMPTY_BOARD);
	const headers = {
		...jsonHeaders,
		"Cache-Control": "public, max-age=60, stale-while-revalidate=600"
	};
	await cache.put(cacheKey, new Response(stored, { headers }));
	return new Response(stored, { headers });
};
//#endregion
//#region worker/leaderboard-admin.ts
/**
* Authenticated list, delete, and a manual projection rebuild. Row ids only ever reach the admin UI
* through here — the public board never carries them.
*/
var handleLeaderboardAdmin = async (request, env) => {
	if (!isAuthorizedUnverifiedSongsAdmin(request, env)) return unauthorizedResponse();
	const board = getBoardStub(env);
	if (!board) return new Response(JSON.stringify({ error: "Leaderboard storage is not configured" }), {
		status: 500,
		headers: responseHeaders$3
	});
	if (request.method === "GET") return new Response(JSON.stringify({ entries: await board.listForAdmin() }), { headers: responseHeaders$3 });
	if (request.method === "POST") {
		const result = await board.rebuild();
		await caches.default.delete(boardCacheKey(request));
		return new Response(JSON.stringify(result), { headers: responseHeaders$3 });
	}
	if (request.method === "DELETE") {
		const id = new URL(request.url).searchParams.get("id")?.trim();
		if (!id) return new Response(JSON.stringify({ error: "Missing query parameter: id" }), {
			status: 400,
			headers: responseHeaders$3
		});
		if (!await board.deleteRow(id)) return new Response(JSON.stringify({ error: "Record not found" }), {
			status: 404,
			headers: responseHeaders$3
		});
		await caches.default.delete(boardCacheKey(request));
		return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders$3 });
	}
	return new Response(JSON.stringify({ error: "Method not allowed" }), {
		status: 405,
		headers: responseHeaders$3
	});
};
//#endregion
//#region worker/leaderboard-do.ts
/** Rows older than this drop out of the board and their notes blobs are deleted. */
var RETENTION_MS = 12096e5;
var ALARM_INTERVAL_MS = 864e5;
/**
* Trimmed, casefolded, whitespace-collapsed. Part of the dedupe key, so a player who re-sings a
* song under the same name replaces their row instead of adding one.
*/
var normalizeName = (name) => name.trim().replace(/\s+/g, " ").toLowerCase();
var toBoardEntry = (row) => ({
	name: row.name,
	country: row.country,
	score: row.score,
	artist: row.artist,
	title: row.title,
	songId: row.song_id,
	tolerance: row.tolerance,
	createdAt: row.created_at
});
var LeaderboardBoard = class extends DurableObject {
	get sql() {
		return this.ctx.storage.sql;
	}
	constructor(ctx, env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this.createSchema();
			if (await ctx.storage.getAlarm() === null) await ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
		});
	}
	createSchema() {
		this.sql.exec(`
      CREATE TABLE IF NOT EXISTS records (
        id               TEXT PRIMARY KEY,
        client_id        TEXT NOT NULL,
        song_id          TEXT NOT NULL,
        artist           TEXT NOT NULL,
        title            TEXT NOT NULL,
        song_last_update TEXT,
        name             TEXT NOT NULL,
        name_normalized  TEXT NOT NULL,
        country          TEXT,
        score            INTEGER NOT NULL,
        tolerance        INTEGER NOT NULL,
        mode             TEXT NOT NULL,
        track_index      INTEGER NOT NULL,
        input_lag        INTEGER NOT NULL,
        notes_hash       TEXT NOT NULL,
        created_at       INTEGER NOT NULL
      );
    `);
		this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS records_dedupe ON records (client_id, song_id, name_normalized);`);
		this.sql.exec(`CREATE INDEX IF NOT EXISTS records_score ON records (score DESC);`);
		this.sql.exec(`CREATE INDEX IF NOT EXISTS records_created_at ON records (created_at);`);
		this.sql.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        record_id TEXT PRIMARY KEY REFERENCES records (id),
        blob      BLOB NOT NULL
      );
    `);
	}
	/**
	* Stores one submission, keeping the higher score for a repeated (client, song, name), and
	* rebuilds the KV projection. Rate limiting is not handled here — it lives entirely in the
	* binding at the Worker edge.
	*/
	async submit(submission, notesBlob) {
		const name = submission.name.trim();
		const nameNormalized = normalizeName(submission.name);
		if (!name || !nameNormalized || !submission.clientId || !submission.songId || !Number.isFinite(submission.score)) return {
			accepted: false,
			reason: "invalid"
		};
		const existing = this.sql.exec(`SELECT id, score FROM records WHERE client_id = ? AND song_id = ? AND name_normalized = ?`, submission.clientId, submission.songId, nameNormalized).toArray()[0];
		if (existing && existing.score >= submission.score) return {
			accepted: false,
			reason: "lower-score"
		};
		const id = existing?.id ?? crypto.randomUUID();
		const createdAt = Date.now();
		if (existing) {
			this.sql.exec(`UPDATE records SET artist = ?, title = ?, song_last_update = ?, name = ?, country = ?, score = ?,
           tolerance = ?, mode = ?, track_index = ?, input_lag = ?, notes_hash = ?, created_at = ?
         WHERE id = ?`, submission.artist, submission.title, submission.songLastUpdate, name, submission.country, submission.score, submission.tolerance, submission.mode, submission.trackIndex, submission.inputLag, submission.notesHash, createdAt, id);
			this.sql.exec(`DELETE FROM notes WHERE record_id = ?`, id);
		} else this.sql.exec(`INSERT INTO records (id, client_id, song_id, artist, title, song_last_update, name, name_normalized,
           country, score, tolerance, mode, track_index, input_lag, notes_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, submission.clientId, submission.songId, submission.artist, submission.title, submission.songLastUpdate, name, nameNormalized, submission.country, submission.score, submission.tolerance, submission.mode, submission.trackIndex, submission.inputLag, submission.notesHash, createdAt);
		this.sql.exec(`INSERT INTO notes (record_id, blob) VALUES (?, ?)`, id, notesBlob);
		await this.rebuildProjection();
		return { accepted: true };
	}
	/**
	* Top {@link BOARD_SIZE} rows of the retention window, in public shape. Never selects `notes`.
	*
	* The difficulty filter is not only about rows submitted before the rule existed — the admin
	* listing still shows everything, so the board is where "Medium or harder" has to hold.
	*/
	projection() {
		const rows = this.sql.exec(`SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records WHERE created_at >= ? AND tolerance <= ? ORDER BY score DESC, created_at ASC LIMIT ?`, Date.now() - RETENTION_MS, 2, 50).toArray();
		return {
			generatedAt: Date.now(),
			entries: rows.map(toBoardEntry)
		};
	}
	/** Every stored row, newest first, including ids. Authenticated admin use only. */
	listForAdmin() {
		return this.sql.exec(`SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records ORDER BY created_at DESC`).toArray().map((row) => ({
			id: row.id,
			...toBoardEntry(row)
		}));
	}
	async deleteRow(id) {
		if (this.sql.exec(`SELECT id FROM records WHERE id = ?`, id).toArray().length === 0) return false;
		this.sql.exec(`DELETE FROM notes WHERE record_id = ?`, id);
		this.sql.exec(`DELETE FROM records WHERE id = ?`, id);
		await this.rebuildProjection();
		return true;
	}
	/**
	* Rebuilds the KV projection from the rows as they stand. Nothing else needs this — every write
	* path rebuilds on its own — but a change to what `projection()` selects (a new filter, a new
	* board size) only reaches the public board on the next write or the daily alarm, and this is
	* the way to apply it on deploy instead of waiting a day.
	*/
	async rebuild() {
		await this.rebuildProjection();
		return { entries: this.projection().entries.length };
	}
	async alarm() {
		const cutoff = Date.now() - RETENTION_MS;
		this.sql.exec(`DELETE FROM notes WHERE record_id IN (SELECT id FROM records WHERE created_at < ?)`, cutoff);
		this.sql.exec(`DELETE FROM records WHERE created_at < ?`, cutoff);
		this.sql.exec(`DELETE FROM notes WHERE record_id NOT IN (SELECT id FROM records)`);
		await this.rebuildProjection();
		await this.ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
	}
	async rebuildProjection() {
		const kv = this.env.LEADERBOARD_KV;
		if (!kv) return;
		try {
			await kv.put(BOARD_KV_KEY, JSON.stringify(this.projection()));
		} catch (error) {
			console.error("Failed to write the leaderboard projection to KV", error);
		}
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
	if (pathname === "/leaderboard") return request.method === "GET" ? handleLeaderboardRead(request, env) : handleLeaderboardSubmit(request, env);
	if (pathname === "/leaderboard-admin") return handleLeaderboardAdmin(request, env);
	if (pathname === "/proxy") return callPagesHandler(onRequest$4, request, env, executionContext);
	if (pathname === "/stry-tunnel") return callPagesHandler(onRequest$3, request, env, executionContext);
	if (pathname === "/ph-data" || pathname.startsWith("/ph-data/")) return callPagesHandler(onRequest$5, request, env, executionContext, { catchall: pathname.slice(8).split("/").filter(Boolean) });
	return new Response("Not found", { status: 404 });
} };
//#endregion
export { LeaderboardBoard, worker_entry_default as default };

//# sourceMappingURL=index.mjs.map