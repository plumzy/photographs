function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Lavender-Sync-Key",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function requestSyncKey(request) {
  const url = new URL(request.url);
  return request.headers.get("X-Lavender-Sync-Key") || url.searchParams.get("syncKey") || "";
}

function requireSyncKey(request, env) {
  if (!env.SYNC_KEY) return true;
  return requestSyncKey(request) === env.SYNC_KEY;
}

async function readJsonBody(request) {
  const text = await request.text();
  return text ? JSON.parse(text) : {};
}

function safeSegment(value) {
  return String(value || "memory").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function decodeDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(String(dataUrl || ""));
  if (!match) throw new Error("Expected a valid data URL.");

  const contentType = match[1] || "application/octet-stream";
  const encoded = match[3] || "";
  const binary = match[2] ? atob(encoded) : decodeURIComponent(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return { contentType, bytes };
}

function getMediaUrl(request, env, key) {
  const publicBase = String(env.PUBLIC_R2_BASE_URL || "").replace(/\/+$/, "");
  if (publicBase) return `${publicBase}/${key}`;
  if (env.PUBLIC_READ === "true") return `${new URL(request.url).origin}/media/${key}`;
  return null;
}

function portableMediaFromBody(media) {
  return {
    id: media.id,
    uri: media.uri,
    thumbnailUri: media.thumbnailUri || media.uri,
    folderId: media.folderId,
    type: media.type || "image",
    createdAt: media.createdAt || new Date().toISOString(),
    caption: media.caption || "",
    captionAuthor: media.captionAuthor || undefined,
    captionEditedAt: media.captionEditedAt || undefined,
    isFavorite: Boolean(media.isFavorite),
    width: media.width || 1400,
    height: media.height || 1800,
    source: media.source || "cloudflare-r2",
    metadata: media.metadata || {},
    includedInCarousel: Boolean(media.includedInCarousel),
    carouselOrder: media.carouselOrder || 0
  };
}

async function handleMediaUpload(request, env, cors) {
  if (!env.MEMORIES_BUCKET) return jsonResponse({ error: "Missing MEMORIES_BUCKET R2 binding." }, 500, cors);
  if (!requireSyncKey(request, env)) return jsonResponse({ error: "Unauthorized Cloudflare sync key." }, 401, cors);

  const body = await readJsonBody(request);
  const { mediaId, folderId, kind, dataUrl, metadata = {} } = body;

  if (!mediaId || !folderId || !kind || !dataUrl) {
    return jsonResponse({ error: "mediaId, folderId, kind, and dataUrl are required." }, 400, cors);
  }

  const decoded = decodeDataUrl(dataUrl);
  const safeFolder = safeSegment(folderId);
  const safeMedia = safeSegment(mediaId);
  const safeKind = safeSegment(kind);
  const key = `memories/${safeFolder}/${safeMedia}/${safeKind}.jpg`;

  await env.MEMORIES_BUCKET.put(key, decoded.bytes, {
    httpMetadata: {
      contentType: decoded.contentType,
      cacheControl: "public, max-age=31536000, immutable"
    },
    customMetadata: {
      mediaId: String(mediaId),
      folderId: String(folderId),
      kind: String(kind),
      source: String(metadata.source || ""),
      captionAuthor: String(metadata.captionAuthor || ""),
      createdAt: String(metadata.createdAt || ""),
      width: String(metadata.width || ""),
      height: String(metadata.height || ""),
      uploadedAt: new Date().toISOString()
    }
  });

  return jsonResponse({ ok: true, key, url: getMediaUrl(request, env, key) }, 200, cors);
}

async function handleLibraryUpsert(request, env, cors) {
  if (!env.MEMORIES_BUCKET) return jsonResponse({ error: "Missing MEMORIES_BUCKET R2 binding." }, 500, cors);
  if (!requireSyncKey(request, env)) return jsonResponse({ error: "Unauthorized Cloudflare sync key." }, 401, cors);

  const body = await readJsonBody(request);
  const media = portableMediaFromBody(body.media || {});

  if (!media.id || !media.folderId || !media.uri) {
    return jsonResponse({ error: "media.id, media.folderId, and media.uri are required." }, 400, cors);
  }

  const key = `library/media/${safeSegment(media.id)}.json`;
  await env.MEMORIES_BUCKET.put(key, JSON.stringify(media), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "no-store"
    },
    customMetadata: {
      mediaId: String(media.id),
      folderId: String(media.folderId),
      updatedAt: new Date().toISOString()
    }
  });

  return jsonResponse({ ok: true, key, media }, 200, cors);
}

async function handleLibraryRead(request, env, cors) {
  if (!env.MEMORIES_BUCKET) return jsonResponse({ error: "Missing MEMORIES_BUCKET R2 binding." }, 500, cors);
  if (!requireSyncKey(request, env)) return jsonResponse({ error: "Unauthorized Cloudflare sync key." }, 401, cors);

  const media = [];
  let cursor;

  do {
    const listed = await env.MEMORIES_BUCKET.list({ prefix: "library/media/", cursor });
    for (const item of listed.objects) {
      const object = await env.MEMORIES_BUCKET.get(item.key);
      if (!object) continue;
      try {
        media.push(JSON.parse(await object.text()));
      } catch {
        // Ignore malformed records so one bad object does not block the library.
      }
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  media.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return jsonResponse({ ok: true, media }, 200, cors);
}

async function handleMediaRead(request, env, cors) {
  if (env.PUBLIC_READ !== "true") return jsonResponse({ error: "Public media reads are disabled." }, 403, cors);

  const key = decodeURIComponent(new URL(request.url).pathname.slice("/media/".length));
  const object = await env.MEMORIES_BUCKET.get(key);

  if (!object) return jsonResponse({ error: "Media object not found." }, 404, cors);

  return new Response(object.body, {
    headers: {
      ...cors,
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable"
    }
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders();
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/health" && request.method === "GET") return jsonResponse({ ok: true, service: "lavender-memories-r2" }, 200, cors);
    if (url.pathname === "/cors-test" && request.method === "GET") return jsonResponse({ ok: true, cors: true, origin: request.headers.get("Origin") || "none" }, 200, cors);
    if (url.pathname === "/media" && request.method === "POST") return handleMediaUpload(request, env, cors);
    if (url.pathname === "/library/media" && request.method === "POST") return handleLibraryUpsert(request, env, cors);
    if (url.pathname === "/library" && request.method === "GET") return handleLibraryRead(request, env, cors);
    if (url.pathname.startsWith("/media/") && request.method === "GET") return handleMediaRead(request, env, cors);

    return jsonResponse({ error: "Not found." }, 404, cors);
  }
};
