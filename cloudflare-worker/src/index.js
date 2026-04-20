function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "https://plumzy.github.io";
  const allowOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
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

function requireSyncKey(request, env) {
  if (!env.SYNC_KEY) return true;
  return request.headers.get("X-Lavender-Sync-Key") === env.SYNC_KEY;
}

function safeSegment(value) {
  return String(value || "memory").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function decodeDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(String(dataUrl || ""));
  if (!match) {
    throw new Error("Expected a valid data URL.");
  }

  const contentType = match[1] || "application/octet-stream";
  const encoded = match[3] || "";
  const binary = match[2] ? atob(encoded) : decodeURIComponent(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return { contentType, bytes };
}

function getPublicUrl(request, env, key) {
  const publicBase = String(env.PUBLIC_R2_BASE_URL || "").replace(/\/+$/, "");
  if (publicBase) return `${publicBase}/${key}`;
  if (env.PUBLIC_READ === "true") {
    return `${new URL(request.url).origin}/media/${encodeURIComponent(key)}`;
  }
  return null;
}

async function handleMediaUpload(request, env, cors) {
  if (!env.MEMORIES_BUCKET) {
    return jsonResponse({ error: "Missing MEMORIES_BUCKET R2 binding." }, 500, cors);
  }

  if (!requireSyncKey(request, env)) {
    return jsonResponse({ error: "Unauthorized Cloudflare sync key." }, 401, cors);
  }

  const body = await request.json();
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

  return jsonResponse({
    ok: true,
    key,
    url: getPublicUrl(request, env, key)
  }, 200, cors);
}

async function handleMediaRead(request, env, cors) {
  if (env.PUBLIC_READ !== "true") {
    return jsonResponse({ error: "Public media reads are disabled." }, 403, cors);
  }

  const key = decodeURIComponent(new URL(request.url).pathname.slice("/media/".length));
  const object = await env.MEMORIES_BUCKET.get(key);

  if (!object) {
    return jsonResponse({ error: "Media object not found." }, 404, cors);
  }

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
    const cors = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse({ ok: true, service: "lavender-memories-r2" }, 200, cors);
    }

    if (url.pathname === "/media" && request.method === "POST") {
      return handleMediaUpload(request, env, cors);
    }

    if (url.pathname.startsWith("/media/") && request.method === "GET") {
      return handleMediaRead(request, env, cors);
    }

    return jsonResponse({ error: "Not found." }, 404, cors);
  }
};
