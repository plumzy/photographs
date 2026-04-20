const LIVE_GOOGLE_PHOTOS_CLIENT_ID = "6980926284-f4qkq32l8nsceeuovi1pug69piku2m1b.apps.googleusercontent.com";
const LIVE_GOOGLE_PHOTOS_SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const LIVE_GOOGLE_PHOTOS_API_BASE = "https://photospicker.googleapis.com/v1";

let liveGooglePhotosToken = null;
let liveGooglePhotosTokenClient = null;
let liveGooglePhotosScriptPromise = null;

function loadLiveGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (liveGooglePhotosScriptPromise) return liveGooglePhotosScriptPromise;

  liveGooglePhotosScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Identity Services."));
    document.head.appendChild(script);
  });

  return liveGooglePhotosScriptPromise;
}

async function getLiveGooglePhotosToken() {
  await loadLiveGoogleIdentity();

  return new Promise((resolve, reject) => {
    if (!liveGooglePhotosTokenClient) {
      liveGooglePhotosTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: LIVE_GOOGLE_PHOTOS_CLIENT_ID,
        scope: LIVE_GOOGLE_PHOTOS_SCOPE,
        callback: () => {}
      });
    }

    liveGooglePhotosTokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error));
        return;
      }
      liveGooglePhotosToken = response.access_token;
      resolve(liveGooglePhotosToken);
    };

    liveGooglePhotosTokenClient.requestAccessToken({
      prompt: liveGooglePhotosToken ? "" : "consent"
    });
  });
}

async function livePhotosRequest(path, token, options = {}) {
  const response = await fetch(`${LIVE_GOOGLE_PHOTOS_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Photos request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function parseLiveGoogleDuration(value, fallbackMs) {
  if (!value || typeof value !== "string") return fallbackMs;
  const seconds = Number(value.replace("s", ""));
  return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
}

function liveWait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createLivePickingSession(token) {
  return livePhotosRequest("/sessions", token, {
    method: "POST",
    body: JSON.stringify({
      pickingConfig: {
        maxItemCount: "100"
      }
    })
  });
}

async function pollLivePickingSession(session, token) {
  let latest = session;
  const timeoutAt = Date.now() + parseLiveGoogleDuration(session.pollingConfig?.timeoutIn, 10 * 60 * 1000);

  while (!latest.mediaItemsSet) {
    if (Date.now() > timeoutAt) {
      throw new Error("Google Photos selection timed out. Try importing again.");
    }
    await liveWait(Math.max(1000, parseLiveGoogleDuration(latest.pollingConfig?.pollInterval, 3000)));
    latest = await livePhotosRequest(`/sessions/${encodeURIComponent(session.id)}`, token);
    byId("importStatus").textContent = "Waiting for your Google Photos selection...";
  }

  return latest;
}

async function listLivePickedItems(sessionId, token) {
  const items = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({ sessionId, pageSize: "100" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await livePhotosRequest(`/mediaItems?${params.toString()}`, token);
    items.push(...(page.mediaItems || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  return items;
}

async function deleteLivePickingSession(sessionId, token) {
  try {
    await livePhotosRequest(`/sessions/${encodeURIComponent(sessionId)}`, token, { method: "DELETE" });
  } catch {
    // Best-effort cleanup.
  }
}

async function compressLivePickedPhoto(item, token) {
  const file = item.mediaFile || {};
  const metadata = file.mediaFileMetadata || {};
  const response = await fetch(`${file.baseUrl}=w${MAX_IMAGE_WIDTH}-h${MAX_IMAGE_WIDTH}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Could not download ${file.filename || "Google Photos item"} (${response.status}).`);
  }

  const blob = await response.blob();
  const pickedFile = new File([blob], file.filename || `${item.id}.jpg`, {
    type: file.mimeType || blob.type || "image/jpeg"
  });
  const compressed = await compressImageFromFile(pickedFile);

  return {
    ...compressed,
    metadata: {
      ...compressed.metadata,
      googlePhotosId: item.id,
      originalCreateTime: item.createTime,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      cameraMake: metadata.cameraMake,
      cameraModel: metadata.cameraModel,
      source: "google-photos-picker"
    }
  };
}

async function importFromLiveGooglePhotos(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  if (!importTargetFolderId) return;
  const status = byId("importStatus");
  const pickerWindow = window.open("about:blank", "lavenderGooglePhotosPicker", "popup,width=980,height=760");

  try {
    status.textContent = "Connecting to Google Photos...";
    const token = await getLiveGooglePhotosToken();
    const session = await createLivePickingSession(token);
    const pickerUrl = `${session.pickerUri}/autoclose`;
    if (pickerWindow) pickerWindow.location.href = pickerUrl;
    else window.open(pickerUrl, "_blank", "noopener,noreferrer");

    status.textContent = "Choose photos in Google Photos, then return here.";
    const completed = await pollLivePickingSession(session, token);
    const pickedItems = await listLivePickedItems(completed.id, token);
    const photos = pickedItems.filter((item) => {
      const mimeType = item.mediaFile?.mimeType || "";
      return item.type === "PHOTO" || mimeType.startsWith("image/");
    });

    if (!photos.length) {
      status.textContent = "No photos were selected.";
      await deleteLivePickingSession(completed.id, token);
      return;
    }

    status.textContent = `Compressing ${photos.length} Google Photos ${photos.length === 1 ? "memory" : "memories"}...`;
    for (const item of photos) {
      const compressed = await compressLivePickedPhoto(item, token);
      const id = createId("media");
      state.media.unshift({
        id,
        uri: compressed.uri,
        thumbnailUri: compressed.thumbnailUri,
        folderId: importTargetFolderId,
        type: "image",
        createdAt: item.createTime || new Date().toISOString(),
        caption: "",
        captionAuthor: undefined,
        captionEditedAt: undefined,
        isFavorite: false,
        width: compressed.width,
        height: compressed.height,
        source: "google-photos",
        metadata: compressed.metadata,
        includedInCarousel: false,
        carouselOrder: 0
      });
    }

    await deleteLivePickingSession(completed.id, token);
    status.textContent = `${photos.length} Google Photos ${photos.length === 1 ? "memory was" : "memories were"} compressed and imported.`;
    commit();
  } catch (error) {
    if (pickerWindow && !pickerWindow.closed) pickerWindow.close();
    status.textContent = error instanceof Error ? error.message : "Google Photos import failed.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = byId("connectGoogle");
  if (!button) return;
  button.textContent = "Import from Google Photos";
  button.addEventListener("click", importFromLiveGooglePhotos, { capture: true });
});
