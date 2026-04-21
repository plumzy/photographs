const CLOUDFLARE_CONFIG_KEY = "lavender-cloudflare-storage-v1";
const CLOUDFLARE_SYNC_DEBOUNCE_MS = 1200;

let cloudflareSyncTimer = null;
let cloudflareSyncRunning = false;
let cloudflareOriginalCommit = null;

function getCloudflareConfig() {
  try {
    return {
      endpoint: "",
      syncKey: "",
      autoSync: false,
      ...(JSON.parse(localStorage.getItem(CLOUDFLARE_CONFIG_KEY) || "{}"))
    };
  } catch {
    return { endpoint: "", syncKey: "", autoSync: false };
  }
}

function saveCloudflareConfig(config) {
  localStorage.setItem(CLOUDFLARE_CONFIG_KEY, JSON.stringify(config));
}

function cleanCloudflareEndpoint(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function cloudflareUrl(config, path) {
  const endpoint = cleanCloudflareEndpoint(config.endpoint);
  const url = new URL(`${endpoint}${path}`);
  if (config.syncKey) url.searchParams.set("syncKey", config.syncKey);
  return url.toString();
}

function cloudflarePostOptions(payload) {
  return {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload)
  };
}

function cloudflareMediaUrl(config, key) {
  if (!key) return "";
  return `${cleanCloudflareEndpoint(config.endpoint)}/media/${key}`;
}

function isCloudflareReady() {
  const config = getCloudflareConfig();
  return Boolean(cleanCloudflareEndpoint(config.endpoint));
}

function setCloudflareStatus(message, tone = "") {
  const status = document.getElementById("cloudflareStatus");
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function installCloudflareStyles() {
  if (document.getElementById("cloudflareStorageStyles")) return;
  const style = document.createElement("style");
  style.id = "cloudflareStorageStyles";
  style.textContent = `
    .cloudflare-panel {
      border: 1px solid rgba(178, 135, 255, 0.22);
      background:
        linear-gradient(135deg, rgba(255,255,255,0.72), rgba(245,232,255,0.42)),
        radial-gradient(circle at top right, rgba(183, 127, 255, 0.2), transparent 38%);
      box-shadow: 0 18px 45px rgba(124, 71, 180, 0.14);
    }

    .cloudflare-form { display: grid; gap: 12px; }
    .cloudflare-input-row { display: grid; gap: 8px; }

    .cloudflare-input-row span {
      color: #6f5b87;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .cloudflare-input-row input[type="url"],
    .cloudflare-input-row input[type="password"] {
      width: 100%;
      min-height: 46px;
      border: 1px solid rgba(154, 107, 219, 0.24);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.68);
      color: #2d2438;
      font: inherit;
      padding: 0 14px;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.74);
    }

    .cloudflare-input-row input:focus {
      border-color: rgba(145, 82, 235, 0.55);
      box-shadow: 0 0 0 4px rgba(174, 125, 255, 0.16);
    }

    .cloudflare-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .cloudflare-toggle { display: flex; gap: 10px; align-items: center; color: #4f3d66; font-weight: 800; }

    .cloudflare-sync-list {
      display: grid;
      gap: 8px;
      margin-top: 6px;
      color: #6b5a7d;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .cloudflare-status { min-height: 20px; white-space: pre-wrap; color: #78658d; font-size: 0.9rem; line-height: 1.4; }
    .cloudflare-status[data-tone="success"] { color: #4f8a68; }
    .cloudflare-status[data-tone="error"] { color: #b14568; }
  `;
  document.head.appendChild(style);
}

function renderCloudflareStoragePanel() {
  installCloudflareStyles();
  if (document.getElementById("cloudflareStoragePanel")) return;

  const settingsList = document.querySelector("#settingsDialog .settings-list");
  if (!settingsList) return;

  const config = getCloudflareConfig();
  const panel = document.createElement("section");
  panel.id = "cloudflareStoragePanel";
  panel.className = "control-card cloudflare-panel";
  panel.innerHTML = `
    <label>Cloudflare R2 storage</label>
    <div class="cloudflare-form">
      <div class="cloudflare-input-row">
        <span>Worker URL</span>
        <input id="cloudflareEndpointInput" type="url" inputmode="url" placeholder="https://photographs.voidkaisa85.workers.dev" value="${config.endpoint || ""}" />
      </div>
      <div class="cloudflare-input-row">
        <span>Sync key</span>
        <input id="cloudflareKeyInput" type="password" autocomplete="off" placeholder="Same value as Worker SYNC_KEY" value="${config.syncKey || ""}" />
      </div>
      <label class="cloudflare-toggle">
        <input id="cloudflareAutoSyncInput" type="checkbox" ${config.autoSync ? "checked" : ""} />
        Auto-sync new imported photos
      </label>
      <div class="cloudflare-actions">
        <button class="primary-button" id="cloudflareSaveButton" type="button">Save storage</button>
        <button class="secondary-button" id="cloudflareTestButton" type="button">Test connection</button>
        <button class="secondary-button" id="cloudflareSyncButton" type="button">Sync existing memories</button>
        <button class="secondary-button" id="cloudflareLoadButton" type="button">Load cloud memories</button>
      </div>
      <p class="cloudflare-status" id="cloudflareStatus"></p>
      <div class="cloudflare-sync-list">
        <span>Device and Google Photos imports are compressed first, then uploaded to R2.</span>
        <span>Use Load cloud memories on another device after saving the same Worker URL and sync key.</span>
      </div>
    </div>
  `;

  settingsList.insertAdjacentElement("afterend", panel);
  bindCloudflarePanel();
}

function currentCloudflareFormConfig() {
  return {
    endpoint: cleanCloudflareEndpoint(document.getElementById("cloudflareEndpointInput")?.value),
    syncKey: String(document.getElementById("cloudflareKeyInput")?.value || "").trim(),
    autoSync: Boolean(document.getElementById("cloudflareAutoSyncInput")?.checked)
  };
}

function bindCloudflarePanel() {
  document.getElementById("cloudflareSaveButton")?.addEventListener("click", () => {
    const config = currentCloudflareFormConfig();
    saveCloudflareConfig(config);
    setCloudflareStatus(config.endpoint ? "Cloudflare storage settings saved." : "Add your Worker URL to enable R2 sync.", config.endpoint ? "success" : "");
    if (config.autoSync) scheduleCloudflareAutoSync();
  });

  document.getElementById("cloudflareTestButton")?.addEventListener("click", () => {
    testCloudflareConnection().catch((error) => {
      setCloudflareStatus(error instanceof Error ? error.message : "Connection test failed.", "error");
    });
  });

  document.getElementById("cloudflareSyncButton")?.addEventListener("click", () => {
    syncCloudflareMedia({ manual: true }).catch((error) => {
      setCloudflareStatus(error instanceof Error ? error.message : "Cloudflare sync failed.", "error");
    });
  });

  document.getElementById("cloudflareLoadButton")?.addEventListener("click", () => {
    loadCloudflareLibrary({ manual: true }).catch((error) => {
      setCloudflareStatus(error instanceof Error ? error.message : "Could not load Cloudflare memories.", "error");
    });
  });
}

async function readDiagnosticResponse(url) {
  const started = performance.now();
  const response = await fetch(url, { method: "GET" });
  const text = await response.text();
  return `${response.status} ${response.statusText} (${Math.round(performance.now() - started)}ms) ${text.slice(0, 220)}`;
}

async function testCloudflareConnection() {
  const config = currentCloudflareFormConfig();
  if (!cleanCloudflareEndpoint(config.endpoint)) {
    setCloudflareStatus("Add your Worker URL first.", "error");
    return;
  }
  saveCloudflareConfig(config);
  setCloudflareStatus("Testing Cloudflare connection...");
  const results = [];
  for (const [label, url] of [
    ["health", `${cleanCloudflareEndpoint(config.endpoint)}/health`],
    ["cors-test", `${cleanCloudflareEndpoint(config.endpoint)}/cors-test`],
    ["library", cloudflareUrl(config, "/library")]
  ]) {
    try {
      results.push(`${label}: ${await readDiagnosticResponse(url)}`);
    } catch (error) {
      results.push(`${label}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }
  setCloudflareStatus(results.join("\n"), results.every((line) => line.includes("200 ")) ? "success" : "error");
}

function getCloudflareUploadableMedia() {
  return state.media.filter((media) => {
    const hasLocalMain = typeof media.uri === "string" && media.uri.startsWith("data:");
    const hasLocalThumb = typeof media.thumbnailUri === "string" && media.thumbnailUri.startsWith("data:");
    const cloudflare = media.metadata?.cloudflare || {};
    return (hasLocalMain || hasLocalThumb) && (!cloudflare.mainKey || !cloudflare.thumbnailKey);
  });
}

async function uploadCloudflareAsset(media, kind, dataUrl, config) {
  const response = await fetch(cloudflareUrl(config, "/media"), cloudflarePostOptions({
    mediaId: media.id,
    folderId: media.folderId,
    kind,
    contentType: "image/jpeg",
    dataUrl,
    metadata: {
      source: media.source,
      captionAuthor: media.captionAuthor || "",
      createdAt: media.createdAt,
      width: media.width,
      height: media.height
    }
  }));

  const payloadText = await response.text();
  let payload = {};
  try { payload = payloadText ? JSON.parse(payloadText) : {}; } catch { payload = { error: payloadText }; }
  if (!response.ok) throw new Error(payload.error || `Cloudflare upload failed (${response.status}).`);
  return payload;
}

function portableCloudflareMedia(media, config) {
  const cloudflare = media.metadata?.cloudflare || {};
  const mainUrl = cloudflare.mainUrl || cloudflareMediaUrl(config, cloudflare.mainKey) || media.uri;
  const thumbnailUrl = cloudflare.thumbnailUrl || cloudflareMediaUrl(config, cloudflare.thumbnailKey) || media.thumbnailUri || mainUrl;

  return {
    id: media.id,
    uri: mainUrl,
    thumbnailUri: thumbnailUrl,
    folderId: media.folderId,
    type: media.type || "image",
    createdAt: media.createdAt,
    caption: media.caption || "",
    captionAuthor: media.captionAuthor,
    captionEditedAt: media.captionEditedAt,
    isFavorite: Boolean(media.isFavorite),
    width: media.width,
    height: media.height,
    source: media.source || "cloudflare-r2",
    metadata: { ...(media.metadata || {}), cloudflare },
    includedInCarousel: Boolean(media.includedInCarousel),
    carouselOrder: media.carouselOrder || 0
  };
}

async function saveCloudflareLibraryEntry(media, config) {
  const portable = portableCloudflareMedia(media, config);
  const response = await fetch(cloudflareUrl(config, "/library/media"), cloudflarePostOptions({ media: portable }));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Cloudflare library save failed (${response.status}).`);
  return payload.media || portable;
}

async function uploadMediaToCloudflare(media, config) {
  const nextCloudflare = { ...(media.metadata?.cloudflare || {}) };

  if (!nextCloudflare.mainKey && typeof media.uri === "string" && media.uri.startsWith("data:")) {
    const uploaded = await uploadCloudflareAsset(media, "main", media.uri, config);
    nextCloudflare.mainKey = uploaded.key;
    nextCloudflare.mainUrl = uploaded.url || cloudflareMediaUrl(config, uploaded.key);
  }

  if (!nextCloudflare.thumbnailKey && typeof media.thumbnailUri === "string" && media.thumbnailUri.startsWith("data:")) {
    const uploaded = await uploadCloudflareAsset(media, "thumbnail", media.thumbnailUri, config);
    nextCloudflare.thumbnailKey = uploaded.key;
    nextCloudflare.thumbnailUrl = uploaded.url || cloudflareMediaUrl(config, uploaded.key);
  }

  media.metadata = { ...(media.metadata || {}), cloudflare: { ...nextCloudflare, uploadedAt: new Date().toISOString() } };
  if (nextCloudflare.mainUrl) media.uri = nextCloudflare.mainUrl;
  if (nextCloudflare.thumbnailUrl) media.thumbnailUri = nextCloudflare.thumbnailUrl;
  await saveCloudflareLibraryEntry(media, config);
}

async function syncCloudflareMedia({ manual = false } = {}) {
  const config = getCloudflareConfig();
  if (!cleanCloudflareEndpoint(config.endpoint)) {
    if (manual) setCloudflareStatus("Add and save your Cloudflare Worker URL first.", "error");
    return;
  }

  if (cloudflareSyncRunning) return;
  const mediaToUpload = getCloudflareUploadableMedia();
  if (!mediaToUpload.length) {
    if (manual) setCloudflareStatus("No compressed local memories need Cloudflare sync right now. Try Load cloud memories on another device.", "success");
    return;
  }

  cloudflareSyncRunning = true;
  let synced = 0;
  try {
    setCloudflareStatus(`Syncing ${mediaToUpload.length} compressed ${mediaToUpload.length === 1 ? "memory" : "memories"} to Cloudflare R2...`);
    for (const media of mediaToUpload) {
      await uploadMediaToCloudflare(media, config);
      synced += 1;
      setCloudflareStatus(`Synced ${synced} of ${mediaToUpload.length} memories to Cloudflare R2...`);
    }
    if (cloudflareOriginalCommit) cloudflareOriginalCommit();
    else commit();
    setCloudflareStatus(`Cloudflare sync complete. ${synced} ${synced === 1 ? "memory" : "memories"} uploaded.`, "success");
  } finally {
    cloudflareSyncRunning = false;
  }
}

function normalizeCloudflareMedia(media) {
  const folderExists = state.folders.some((folder) => folder.id === media.folderId);
  return {
    id: media.id,
    uri: media.uri,
    thumbnailUri: media.thumbnailUri || media.uri,
    folderId: folderExists ? media.folderId : state.folders[0]?.id,
    type: media.type || "image",
    createdAt: media.createdAt || new Date().toISOString(),
    caption: media.caption || "",
    captionAuthor: media.captionAuthor,
    captionEditedAt: media.captionEditedAt,
    isFavorite: Boolean(media.isFavorite),
    width: media.width || 1400,
    height: media.height || 1800,
    source: media.source || "cloudflare-r2",
    metadata: media.metadata || {},
    includedInCarousel: Boolean(media.includedInCarousel),
    carouselOrder: media.carouselOrder || 0
  };
}

async function loadCloudflareLibrary({ manual = false } = {}) {
  const config = getCloudflareConfig();
  if (!cleanCloudflareEndpoint(config.endpoint)) {
    if (manual) setCloudflareStatus("Add and save your Cloudflare Worker URL first.", "error");
    return;
  }

  setCloudflareStatus("Loading Cloudflare memories...");
  const response = await fetch(cloudflareUrl(config, "/library"), { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Could not load Cloudflare library (${response.status}).`);

  const remoteMedia = (payload.media || []).map(normalizeCloudflareMedia);
  let added = 0;
  let updated = 0;

  for (const remote of remoteMedia) {
    const index = state.media.findIndex((item) => item.id === remote.id);
    if (index >= 0) {
      state.media[index] = { ...state.media[index], ...remote, metadata: { ...(state.media[index].metadata || {}), ...(remote.metadata || {}) } };
      updated += 1;
    } else {
      state.media.unshift(remote);
      added += 1;
    }
  }

  const selectedIds = new Set(state.settings.selectedMediaIds || []);
  remoteMedia.forEach((media) => { if (media.includedInCarousel) selectedIds.add(media.id); });
  state.settings.selectedMediaIds = [...selectedIds].filter((id) => state.media.some((media) => media.id === id));
  state.media = syncCarouselFlags(state.media, state.settings.selectedMediaIds);

  if (cloudflareOriginalCommit) cloudflareOriginalCommit();
  else commit();
  setCloudflareStatus(`Loaded ${remoteMedia.length} cloud memories. ${added} added, ${updated} updated.`, "success");
}

function scheduleCloudflareAutoSync() {
  const config = getCloudflareConfig();
  if (!config.autoSync || !isCloudflareReady()) return;
  window.clearTimeout(cloudflareSyncTimer);
  cloudflareSyncTimer = window.setTimeout(() => {
    syncCloudflareMedia().catch((error) => {
      setCloudflareStatus(error instanceof Error ? error.message : "Cloudflare auto-sync failed.", "error");
    });
  }, CLOUDFLARE_SYNC_DEBOUNCE_MS);
}

function installCloudflareCommitHook() {
  if (cloudflareOriginalCommit || typeof commit !== "function") return;
  cloudflareOriginalCommit = commit;
  commit = function commitWithCloudflareSync() {
    cloudflareOriginalCommit();
    scheduleCloudflareAutoSync();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderCloudflareStoragePanel();
  installCloudflareCommitHook();
});
