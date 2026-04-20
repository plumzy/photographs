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

    .cloudflare-form {
      display: grid;
      gap: 12px;
    }

    .cloudflare-input-row {
      display: grid;
      gap: 8px;
    }

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

    .cloudflare-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .cloudflare-toggle {
      display: flex;
      gap: 10px;
      align-items: center;
      color: #4f3d66;
      font-weight: 800;
    }

    .cloudflare-sync-list {
      display: grid;
      gap: 8px;
      margin-top: 6px;
      color: #6b5a7d;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .cloudflare-status {
      min-height: 20px;
      color: #78658d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

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
        <input id="cloudflareEndpointInput" type="url" inputmode="url" placeholder="https://lavender-memories.your-name.workers.dev" value="${config.endpoint || ""}" />
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
        <button class="secondary-button" id="cloudflareSyncButton" type="button">Sync existing memories</button>
      </div>
      <p class="cloudflare-status" id="cloudflareStatus"></p>
      <div class="cloudflare-sync-list">
        <span>Device and Google Photos imports are compressed first, then uploaded to R2.</span>
        <span>Demo images from remote URLs are skipped until they are imported as app photos.</span>
      </div>
    </div>
  `;

  settingsList.insertAdjacentElement("afterend", panel);
  bindCloudflarePanel();
}

function bindCloudflarePanel() {
  const endpointInput = document.getElementById("cloudflareEndpointInput");
  const keyInput = document.getElementById("cloudflareKeyInput");
  const autoInput = document.getElementById("cloudflareAutoSyncInput");
  const saveButton = document.getElementById("cloudflareSaveButton");
  const syncButton = document.getElementById("cloudflareSyncButton");

  saveButton?.addEventListener("click", () => {
    const config = {
      endpoint: cleanCloudflareEndpoint(endpointInput?.value),
      syncKey: String(keyInput?.value || "").trim(),
      autoSync: Boolean(autoInput?.checked)
    };
    saveCloudflareConfig(config);
    setCloudflareStatus(config.endpoint ? "Cloudflare storage settings saved." : "Add your Worker URL to enable R2 sync.", config.endpoint ? "success" : "");
    if (config.autoSync) scheduleCloudflareAutoSync();
  });

  syncButton?.addEventListener("click", () => {
    syncCloudflareMedia({ manual: true }).catch((error) => {
      setCloudflareStatus(error instanceof Error ? error.message : "Cloudflare sync failed.", "error");
    });
  });
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
  const response = await fetch(`${cleanCloudflareEndpoint(config.endpoint)}/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.syncKey ? { "X-Lavender-Sync-Key": config.syncKey } : {})
    },
    body: JSON.stringify({
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
    })
  });

  const payloadText = await response.text();
  let payload = {};
  try {
    payload = payloadText ? JSON.parse(payloadText) : {};
  } catch {
    payload = { error: payloadText };
  }

  if (!response.ok) {
    throw new Error(payload.error || `Cloudflare upload failed (${response.status}).`);
  }

  return payload;
}

async function uploadMediaToCloudflare(media, config) {
  const cloudflare = media.metadata?.cloudflare || {};
  const nextCloudflare = { ...cloudflare };

  if (!nextCloudflare.mainKey && typeof media.uri === "string" && media.uri.startsWith("data:")) {
    const uploaded = await uploadCloudflareAsset(media, "main", media.uri, config);
    nextCloudflare.mainKey = uploaded.key;
    nextCloudflare.mainUrl = uploaded.url || null;
  }

  if (!nextCloudflare.thumbnailKey && typeof media.thumbnailUri === "string" && media.thumbnailUri.startsWith("data:")) {
    const uploaded = await uploadCloudflareAsset(media, "thumbnail", media.thumbnailUri, config);
    nextCloudflare.thumbnailKey = uploaded.key;
    nextCloudflare.thumbnailUrl = uploaded.url || null;
  }

  media.metadata = {
    ...(media.metadata || {}),
    cloudflare: {
      ...nextCloudflare,
      uploadedAt: new Date().toISOString()
    }
  };
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
    if (manual) setCloudflareStatus("No compressed local memories need Cloudflare sync right now.", "success");
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
    if (cloudflareOriginalCommit) {
      cloudflareOriginalCommit();
    } else {
      commit();
    }
    setCloudflareStatus(`Cloudflare sync complete. ${synced} ${synced === 1 ? "memory" : "memories"} uploaded.`, "success");
  } finally {
    cloudflareSyncRunning = false;
  }
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
