const STORAGE_KEY = "lavender-memories-static-v1";
const IMAGE_QUALITY = 0.68;
const THUMB_QUALITY = 0.66;
const MAX_IMAGE_WIDTH = 1600;
const THUMB_WIDTH = 420;

const mockFolders = [
  { id: "folder_first_dates", name: "First Dates", coverMediaId: "media_date_01", mediaCount: 3, isHighlighted: true },
  { id: "folder_everyday", name: "Everyday Magic", coverMediaId: "media_everyday_01", mediaCount: 3, isHighlighted: false },
  { id: "folder_trips", name: "Little Trips", coverMediaId: "media_trip_01", mediaCount: 3, isHighlighted: true }
];

const createPhoto = (id, values) => ({
  id,
  uri: values.uri,
  thumbnailUri: values.thumbnailUri || values.uri,
  folderId: values.folderId || "folder_first_dates",
  type: "image",
  createdAt: values.createdAt || new Date().toISOString(),
  caption: values.caption || "",
  captionAuthor: values.captionAuthor,
  captionEditedAt: values.captionEditedAt,
  isFavorite: Boolean(values.isFavorite),
  width: values.width || 1400,
  height: values.height || 1800,
  source: values.source || "mock",
  metadata: values.metadata || {},
  includedInCarousel: values.includedInCarousel !== false,
  carouselOrder: values.carouselOrder || 0
});

const mockMedia = [
  createPhoto("media_date_01", {
    folderId: "folder_first_dates",
    uri: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=74",
    caption: "The night everything felt softer.",
    captionAuthor: "You",
    isFavorite: true,
    carouselOrder: 1,
    createdAt: "2024-02-14T19:30:00.000Z"
  }),
  createPhoto("media_date_02", {
    folderId: "folder_first_dates",
    uri: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=74",
    caption: "A quiet table, two hands, one favorite memory.",
    captionAuthor: "Her",
    carouselOrder: 2,
    createdAt: "2024-03-08T12:15:00.000Z"
  }),
  createPhoto("media_date_03", {
    folderId: "folder_first_dates",
    uri: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=500&q=74",
    caption: "",
    carouselOrder: 3,
    createdAt: "2024-05-10T16:10:00.000Z"
  }),
  createPhoto("media_everyday_01", {
    folderId: "folder_everyday",
    uri: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=500&q=74",
    caption: "Your laugh in ordinary light.",
    captionAuthor: "You",
    carouselOrder: 4,
    createdAt: "2024-07-01T08:20:00.000Z"
  }),
  createPhoto("media_everyday_02", {
    folderId: "folder_everyday",
    uri: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=74",
    caption: "Small moments, saved forever.",
    captionAuthor: "Her",
    carouselOrder: 5,
    createdAt: "2024-09-19T11:45:00.000Z"
  }),
  createPhoto("media_everyday_03", {
    folderId: "folder_everyday",
    uri: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=500&q=74",
    caption: "",
    includedInCarousel: false,
    createdAt: "2024-10-12T15:25:00.000Z"
  }),
  createPhoto("media_trip_01", {
    folderId: "folder_trips",
    uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=74",
    caption: "A weekend that became a favorite chapter.",
    captionAuthor: "You",
    isFavorite: true,
    carouselOrder: 6,
    createdAt: "2024-11-03T06:40:00.000Z"
  }),
  createPhoto("media_trip_02", {
    folderId: "folder_trips",
    uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=74",
    caption: "The shore, the breeze, your hand in mine.",
    captionAuthor: "Her",
    carouselOrder: 7,
    createdAt: "2025-01-26T17:30:00.000Z"
  }),
  createPhoto("media_trip_03", {
    folderId: "folder_trips",
    uri: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1500&q=82",
    thumbnailUri: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=500&q=74",
    caption: "",
    includedInCarousel: false,
    createdAt: "2025-03-17T09:05:00.000Z"
  })
];

const mockGoogleAlbums = [
  {
    id: "gp_anniversary",
    title: "Anniversary Weekend",
    mediaCount: 2,
    coverUri: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=74"
  },
  {
    id: "gp_tulips",
    title: "Tulip Walks",
    mediaCount: 2,
    coverUri: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=74"
  }
];

const mockGoogleMedia = [
  {
    id: "gp_001",
    albumId: "gp_anniversary",
    uri: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=84",
    fileName: "anniversary-table.jpg",
    mimeType: "image/jpeg"
  },
  {
    id: "gp_002",
    albumId: "gp_anniversary",
    uri: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=84",
    fileName: "soft-lights.jpg",
    mimeType: "image/jpeg"
  },
  {
    id: "gp_003",
    albumId: "gp_tulips",
    uri: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1600&q=84",
    fileName: "lavender-tulips.jpg",
    mimeType: "image/jpeg"
  },
  {
    id: "gp_004",
    albumId: "gp_tulips",
    uri: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=84",
    fileName: "flower-market.jpg",
    mimeType: "image/jpeg"
  }
];

const $ = (selector) => document.querySelector(selector);
const byId = (id) => document.getElementById(id);

let state = loadState();
let carouselIndex = 0;
let carouselTimer;
let currentFolderId = null;
let currentViewerIds = [];
let viewerIndex = 0;
let selectedIds = new Set();
let importTargetFolderId = state.folders[0]?.id;
let captionTargetId = null;
let captionAuthor = "You";
let moveTargetIds = [];
let selectedGoogleIds = new Set();
let googleConnected = false;
let selectedGoogleAlbumId = mockGoogleAlbums[0].id;
let longPressTriggered = false;
let heroWasSwiped = false;

const el = {
  heroStage: byId("heroStage"),
  heroImage: byId("heroImage"),
  heroCaption: byId("heroCaption"),
  emptyHero: byId("emptyHero"),
  heroDots: byId("heroDots"),
  playToggle: byId("playToggle"),
  folderGrid: byId("folderGrid"),
  folderDialog: byId("folderDialog"),
  folderTitle: byId("folderTitle"),
  folderSubtitle: byId("folderSubtitle"),
  mediaGrid: byId("mediaGrid"),
  batchBar: byId("batchBar"),
  batchCount: byId("batchCount"),
  viewerDialog: byId("viewerDialog"),
  viewerImage: byId("viewerImage"),
  viewerCounter: byId("viewerCounter"),
  viewerCaption: byId("viewerCaption"),
  settingsDialog: byId("settingsDialog"),
  importDialog: byId("importDialog"),
  captionDialog: byId("captionDialog"),
  moveDialog: byId("moveDialog")
};

function createInitialState() {
  const selectedMediaIds = mockMedia.filter((item) => item.includedInCarousel).map((item) => item.id);
  return {
    folders: JSON.parse(JSON.stringify(mockFolders)),
    media: syncCarouselFlags(JSON.parse(JSON.stringify(mockMedia)), selectedMediaIds),
    settings: {
      mode: "all",
      selectedFolderId: "folder_first_dates",
      selectedMediaIds,
      autoRotate: true,
      rotationInterval: 4200,
      showCaptions: true,
      glowIntensity: 0.82
    }
  };
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return recalcFolders(JSON.parse(stored));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return recalcFolders(createInitialState());
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    alert("Browser storage is full. Large imported photos may need to be removed before saving more.");
    console.error(error);
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function recalcFolders(nextState = state) {
  nextState.folders = nextState.folders.map((folder) => {
    const folderMedia = nextState.media
      .filter((item) => item.folderId === folder.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const coverStillExists = folder.coverMediaId && folderMedia.some((item) => item.id === folder.coverMediaId);
    return {
      ...folder,
      mediaCount: folderMedia.length,
      coverMediaId: coverStillExists ? folder.coverMediaId : folderMedia[0]?.id
    };
  });
  return nextState;
}

function syncCarouselFlags(media, selectedMediaIds) {
  return media.map((item) => {
    const index = selectedMediaIds.indexOf(item.id);
    return {
      ...item,
      includedInCarousel: index >= 0,
      carouselOrder: index >= 0 ? index + 1 : 0
    };
  });
}

function commit() {
  state = recalcFolders(state);
  saveState();
  renderAll();
}

function getCarouselMedia() {
  const { mode, selectedFolderId, selectedMediaIds } = state.settings;
  if (mode === "folder") {
    return state.media
      .filter((item) => item.folderId === selectedFolderId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  if (mode === "selected") {
    return selectedMediaIds.map((id) => state.media.find((item) => item.id === id)).filter(Boolean);
  }
  return [...state.media].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function folderMedia(folderId) {
  return state.media
    .filter((item) => item.folderId === folderId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function mediaById(id) {
  return state.media.find((item) => item.id === id);
}

function folderById(id) {
  return state.folders.find((folder) => folder.id === id);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAll() {
  renderCarousel();
  renderFolders();
  if (el.folderDialog.open && currentFolderId) renderFolderDialog(currentFolderId);
  if (el.settingsDialog.open) renderSettings();
  if (el.importDialog.open) renderImport();
  if (el.viewerDialog.open) renderViewer();
}

function renderCarousel() {
  const items = getCarouselMedia();
  document.documentElement.style.setProperty("--hero-glow", `rgba(181, 112, 255, ${state.settings.glowIntensity * 0.72})`);
  if (carouselIndex >= items.length) carouselIndex = 0;
  el.emptyHero.classList.toggle("show", items.length === 0);
  el.heroImage.classList.toggle("active", items.length > 0);
  el.heroImage.hidden = items.length === 0;
  byId("prevHero").hidden = items.length < 2;
  byId("nextHero").hidden = items.length < 2;

  if (items.length) {
    const item = items[carouselIndex];
    el.heroImage.src = item.uri;
    el.heroImage.alt = item.caption || "Anniversary memory";
    el.heroCaption.classList.toggle("show", state.settings.showCaptions);
    el.heroCaption.innerHTML = state.settings.showCaptions
      ? `<div class="caption-author">${escapeHtml(item.captionAuthor ? `${item.captionAuthor} wrote` : "Memory")}</div>
         <div class="caption-copy">${escapeHtml(item.caption || "Add a memory here...")}</div>`
      : "";
  }

  el.heroDots.innerHTML = items
    .map((item, index) => `<span class="${index === carouselIndex ? "active" : ""}" data-dot="${item.id}"></span>`)
    .join("");
  el.playToggle.textContent = state.settings.autoRotate ? "Ⅱ" : "▶";
  el.playToggle.setAttribute("aria-label", state.settings.autoRotate ? "Pause carousel" : "Play carousel");
  restartCarouselTimer();
}

function restartCarouselTimer() {
  clearInterval(carouselTimer);
  const items = getCarouselMedia();
  if (!state.settings.autoRotate || items.length <= 1) return;
  carouselTimer = setInterval(() => changeCarousel(1), state.settings.rotationInterval);
}

function changeCarousel(direction) {
  const items = getCarouselMedia();
  if (!items.length) return;
  carouselIndex = (carouselIndex + direction + items.length) % items.length;
  el.heroImage.classList.remove("active");
  window.setTimeout(renderCarousel, 90);
}

function renderFolders() {
  el.folderGrid.innerHTML = state.folders
    .map((folder) => {
      const cover = mediaById(folder.coverMediaId) || folderMedia(folder.id)[0];
      return `
        <button class="folder-card" type="button" data-folder="${folder.id}">
          ${cover ? `<img src="${cover.thumbnailUri}" alt="">` : ""}
          ${folder.isHighlighted ? `<span class="highlight-badge">♧</span>` : ""}
          <span class="folder-copy">
            <strong>${escapeHtml(folder.name)}</strong>
            <span>${folder.mediaCount} memories</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function openFolder(folderId) {
  currentFolderId = folderId;
  selectedIds.clear();
  renderFolderDialog(folderId);
  el.folderDialog.showModal();
}

function renderFolderDialog(folderId) {
  const folder = folderById(folderId);
  const items = folderMedia(folderId);
  el.folderTitle.textContent = folder?.name || "Folder";
  el.folderSubtitle.textContent = `${items.length} memories`;
  el.batchBar.classList.toggle("show", selectedIds.size > 0);
  el.batchCount.textContent = `${selectedIds.size} selected`;
  if (!items.length) {
    el.mediaGrid.innerHTML = `<div class="empty-inline"><h2>No memories here yet</h2><p>Import photos into this folder to start this chapter.</p></div>`;
    return;
  }
  el.mediaGrid.innerHTML = items
    .map(
      (item) => `
      <button class="media-card ${selectedIds.has(item.id) ? "selected" : ""}" type="button" data-media="${item.id}">
        <img src="${item.thumbnailUri}" alt="">
        ${item.includedInCarousel ? `<span class="carousel-badge">✦</span>` : ""}
        ${selectedIds.size ? `<span class="check-badge">${selectedIds.has(item.id) ? "✓" : "+"}</span>` : ""}
        ${item.caption ? `<span class="media-copy">${escapeHtml(item.caption)}</span>` : ""}
      </button>
    `
    )
    .join("");
}

function toggleSelected(id) {
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  renderFolderDialog(currentFolderId);
}

function openViewer(ids, startId) {
  currentViewerIds = ids;
  viewerIndex = Math.max(0, ids.indexOf(startId));
  renderViewer();
  el.viewerDialog.showModal();
}

function renderViewer() {
  const item = mediaById(currentViewerIds[viewerIndex]);
  if (!item) {
    el.viewerDialog.close();
    return;
  }
  el.viewerImage.src = item.uri;
  el.viewerImage.alt = item.caption || "Anniversary memory";
  el.viewerCounter.textContent = `${viewerIndex + 1} / ${currentViewerIds.length}`;
  el.viewerCaption.innerHTML = `
    <div class="caption-author">${escapeHtml(item.captionAuthor ? `${item.captionAuthor} wrote` : "Memory caption")}</div>
    <div class="caption-copy">${escapeHtml(item.caption || "Add a memory here...")}</div>
  `;
  byId("toggleCarouselButton").textContent = item.includedInCarousel ? "Remove" : "Carousel";
}

function changeViewer(direction) {
  if (!currentViewerIds.length) return;
  viewerIndex = (viewerIndex + direction + currentViewerIds.length) % currentViewerIds.length;
  renderViewer();
}

function deleteMedia(ids) {
  const idSet = new Set(ids);
  state.media = state.media.filter((item) => !idSet.has(item.id));
  state.settings.selectedMediaIds = state.settings.selectedMediaIds.filter((id) => !idSet.has(id));
  state.media = syncCarouselFlags(state.media, state.settings.selectedMediaIds);
  selectedIds.clear();
  currentViewerIds = currentViewerIds.filter((id) => !idSet.has(id));
  if (!currentViewerIds.length && el.viewerDialog.open) el.viewerDialog.close();
  if (viewerIndex >= currentViewerIds.length) viewerIndex = Math.max(0, currentViewerIds.length - 1);
  commit();
}

function moveMedia(ids, targetFolderId) {
  const idSet = new Set(ids);
  state.media = state.media.map((item) => (idSet.has(item.id) ? { ...item, folderId: targetFolderId } : item));
  selectedIds.clear();
  el.moveDialog.close();
  commit();
}

function toggleCarouselInclusion(id) {
  const ids = state.settings.selectedMediaIds;
  state.settings.selectedMediaIds = ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id];
  state.media = syncCarouselFlags(state.media, state.settings.selectedMediaIds);
  commit();
}

function openCaptionEditor(id) {
  const item = mediaById(id);
  if (!item) return;
  captionTargetId = id;
  captionAuthor = item.captionAuthor || "You";
  byId("captionInput").value = item.caption || "";
  byId("captionSubtext").textContent = item.captionEditedAt
    ? `Edited ${new Date(item.captionEditedAt).toLocaleDateString()}`
    : "Add a memory here...";
  renderCaptionAuthor();
  el.captionDialog.showModal();
}

function renderCaptionAuthor() {
  byId("authorYou").classList.toggle("active", captionAuthor === "You");
  byId("authorHer").classList.toggle("active", captionAuthor === "Her");
}

function saveCaption() {
  const item = mediaById(captionTargetId);
  if (!item) return;
  const value = byId("captionInput").value.trim();
  item.caption = value;
  item.captionAuthor = value ? captionAuthor : undefined;
  item.captionEditedAt = new Date().toISOString();
  el.captionDialog.close();
  commit();
}

function deleteCaption() {
  const item = mediaById(captionTargetId);
  if (!item) return;
  item.caption = "";
  item.captionAuthor = undefined;
  item.captionEditedAt = new Date().toISOString();
  el.captionDialog.close();
  commit();
}

function renderSettings() {
  const modeControls = byId("modeControls");
  modeControls.innerHTML = [
    ["all", "All Photos"],
    ["folder", "Folder Cycle"],
    ["selected", "Selected"]
  ]
    .map(([id, label]) => `<button class="${state.settings.mode === id ? "active" : ""}" data-mode="${id}" type="button">${label}</button>`)
    .join("");

  byId("folderCycleControls").hidden = state.settings.mode !== "folder";
  byId("selectedControls").hidden = state.settings.mode !== "selected";
  byId("folderSourceList").innerHTML = state.folders
    .map(
      (folder) =>
        `<button class="${state.settings.selectedFolderId === folder.id ? "active" : ""}" data-source-folder="${folder.id}" type="button">${escapeHtml(folder.name)}</button>`
    )
    .join("");

  byId("selectedPhotoGrid").innerHTML = state.media.map(renderSelectablePhoto).join("");
  byId("rotationPreview").innerHTML = getCarouselMedia()
    .map(
      (item, index) => `
        <div class="preview-card">
          <img src="${item.thumbnailUri}" alt="">
          <span class="preview-order">${index + 1}</span>
          ${state.settings.mode === "selected" ? `<span class="reorder"><button data-reorder="${item.id}" data-dir="-1">‹</button><button data-reorder="${item.id}" data-dir="1">›</button></span>` : ""}
        </div>
      `
    )
    .join("");

  byId("autoRotateInput").checked = state.settings.autoRotate;
  byId("showCaptionsInput").checked = state.settings.showCaptions;
  byId("speedInput").value = state.settings.rotationInterval;
  byId("speedValue").textContent = (state.settings.rotationInterval / 1000).toFixed(1);
  byId("glowInput").value = Math.round(state.settings.glowIntensity * 100);
  byId("glowValue").textContent = Math.round(state.settings.glowIntensity * 100);
}

function renderSelectablePhoto(item) {
  const selected = state.settings.selectedMediaIds.includes(item.id);
  return `
    <button class="select-card ${selected ? "selected" : ""}" type="button" data-select-carousel="${item.id}">
      <img src="${item.thumbnailUri}" alt="">
      <span class="check-badge">${selected ? "✓" : "+"}</span>
    </button>
  `;
}

function reorderSelected(id, direction) {
  const ids = [...state.settings.selectedMediaIds];
  const index = ids.indexOf(id);
  const next = index + Number(direction);
  if (index < 0 || next < 0 || next >= ids.length) return;
  const [removed] = ids.splice(index, 1);
  ids.splice(next, 0, removed);
  state.settings.selectedMediaIds = ids;
  state.media = syncCarouselFlags(state.media, ids);
  commit();
}

function renderImport() {
  byId("importFolderList").innerHTML = state.folders
    .map(
      (folder) =>
        `<button class="${importTargetFolderId === folder.id ? "active" : ""}" data-import-folder="${folder.id}" type="button">${escapeHtml(folder.name)}</button>`
    )
    .join("");

  byId("googleAlbums").innerHTML = googleConnected
    ? mockGoogleAlbums
        .map(
          (album) => `
            <button class="album-card ${selectedGoogleAlbumId === album.id ? "active" : ""}" data-google-album="${album.id}" type="button">
              <img src="${album.coverUri}" alt="">
              <strong>${escapeHtml(album.title)}</strong>
              <p>${album.mediaCount} photos</p>
            </button>
          `
        )
        .join("")
    : "";

  byId("googleMediaGrid").innerHTML = googleConnected
    ? mockGoogleMedia
        .filter((item) => item.albumId === selectedGoogleAlbumId)
        .map(
          (item) => `
            <button class="select-card ${selectedGoogleIds.has(item.id) ? "selected" : ""}" data-google-media="${item.id}" type="button">
              <img src="${item.uri}" alt="">
              <span class="check-badge">${selectedGoogleIds.has(item.id) ? "✓" : "+"}</span>
            </button>
          `
        )
        .join("")
    : "";
  byId("importGoogleSelected").hidden = !googleConnected;
}

async function compressImageFromFile(file) {
  const source = URL.createObjectURL(file);
  try {
    const main = await drawCompressed(source, MAX_IMAGE_WIDTH, IMAGE_QUALITY);
    const thumb = await drawCompressed(source, THUMB_WIDTH, THUMB_QUALITY);
    return {
      uri: main.dataUrl,
      thumbnailUri: thumb.dataUrl,
      width: main.width,
      height: main.height,
      metadata: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        importedAt: new Date().toISOString()
      }
    };
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function compressImageFromUrl(url, metadata = {}) {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const file = new File([blob], metadata.fileName || "google-photo.jpg", { type: blob.type || "image/jpeg" });
    const compressed = await compressImageFromFile(file);
    return {
      ...compressed,
      metadata: { ...compressed.metadata, ...metadata, originalUri: url }
    };
  } catch {
    return {
      uri: url,
      thumbnailUri: url,
      width: 1400,
      height: 1800,
      metadata: { ...metadata, originalUri: url, importedAt: new Date().toISOString(), compressionFallback: true }
    };
  }
}

function drawCompressed(source, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxWidth / image.naturalWidth);
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", quality), width, height });
    };
    image.onerror = reject;
    image.src = source;
  });
}

async function importFiles(files) {
  if (!importTargetFolderId || !files.length) return;
  const status = byId("importStatus");
  status.textContent = "Compressing memories...";
  for (const file of files) {
    const compressed = await compressImageFromFile(file);
    const id = createId("media");
    state.media.unshift({
      id,
      uri: compressed.uri,
      thumbnailUri: compressed.thumbnailUri,
      folderId: importTargetFolderId,
      type: "image",
      createdAt: new Date().toISOString(),
      caption: "",
      captionAuthor: undefined,
      captionEditedAt: undefined,
      isFavorite: false,
      width: compressed.width,
      height: compressed.height,
      source: "device",
      metadata: compressed.metadata,
      includedInCarousel: false,
      carouselOrder: 0
    });
  }
  status.textContent = `${files.length} photo${files.length === 1 ? "" : "s"} compressed and imported.`;
  commit();
}

async function importGoogleSelected() {
  const selected = mockGoogleMedia.filter((item) => selectedGoogleIds.has(item.id));
  if (!selected.length) {
    byId("importStatus").textContent = "Choose one or more Google Photos memories first.";
    return;
  }
  byId("importStatus").textContent = "Importing and compressing Google Photos memories...";
  for (const item of selected) {
    const compressed = await compressImageFromUrl(item.uri, {
      googlePhotosId: item.id,
      albumId: item.albumId,
      fileName: item.fileName,
      mimeType: item.mimeType
    });
    const id = createId("media");
    state.media.unshift({
      id,
      uri: compressed.uri,
      thumbnailUri: compressed.thumbnailUri,
      folderId: importTargetFolderId,
      type: "image",
      createdAt: new Date().toISOString(),
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
  byId("importStatus").textContent = `${selected.length} Google Photos memories imported.`;
  selectedGoogleIds.clear();
  commit();
}

function openMoveDialog(ids) {
  moveTargetIds = ids;
  byId("moveCount").textContent = `${ids.length} selected`;
  byId("moveFolderList").innerHTML = state.folders
    .map((folder) => `<button data-move-folder="${folder.id}" type="button">${escapeHtml(folder.name)} · ${folder.mediaCount}</button>`)
    .join("");
  el.moveDialog.showModal();
}

function bindEvents() {
  byId("settingsButton").addEventListener("click", () => {
    renderSettings();
    el.settingsDialog.showModal();
  });
  byId("importButton").addEventListener("click", () => {
    importTargetFolderId = state.folders[0]?.id;
    renderImport();
    el.importDialog.showModal();
  });
  byId("closeSettings").addEventListener("click", () => el.settingsDialog.close());
  byId("closeImport").addEventListener("click", () => el.importDialog.close());
  byId("closeFolder").addEventListener("click", () => el.folderDialog.close());
  byId("closeViewer").addEventListener("click", () => el.viewerDialog.close());
  byId("closeCaption").addEventListener("click", () => el.captionDialog.close());
  byId("closeMove").addEventListener("click", () => el.moveDialog.close());
  byId("prevHero").addEventListener("click", () => changeCarousel(-1));
  byId("nextHero").addEventListener("click", () => changeCarousel(1));
  byId("playToggle").addEventListener("click", () => {
    state.settings.autoRotate = !state.settings.autoRotate;
    commit();
  });
  el.heroStage.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    if (heroWasSwiped) {
      heroWasSwiped = false;
      return;
    }
    const item = getCarouselMedia()[carouselIndex];
    if (item) openViewer(getCarouselMedia().map((media) => media.id), item.id);
  });

  let startX = 0;
  el.heroStage.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  el.heroStage.addEventListener("pointerup", (event) => {
    const diff = event.clientX - startX;
    if (Math.abs(diff) > 45) {
      heroWasSwiped = true;
      changeCarousel(diff > 0 ? -1 : 1);
    }
  });

  el.folderGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-folder]");
    if (card) openFolder(card.dataset.folder);
  });

  byId("folderImportButton").addEventListener("click", () => {
    importTargetFolderId = currentFolderId;
    renderImport();
    el.importDialog.showModal();
  });

  el.mediaGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-media]");
    if (!card) return;
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }
    if (selectedIds.size) toggleSelected(card.dataset.media);
    else openViewer(folderMedia(currentFolderId).map((item) => item.id), card.dataset.media);
  });

  el.mediaGrid.addEventListener("contextmenu", (event) => {
    const card = event.target.closest("[data-media]");
    if (!card) return;
    event.preventDefault();
    toggleSelected(card.dataset.media);
  });

  el.mediaGrid.addEventListener("pointerdown", (event) => {
    const card = event.target.closest("[data-media]");
    if (!card) return;
    longPressTriggered = false;
    const timer = setTimeout(() => {
      longPressTriggered = true;
      toggleSelected(card.dataset.media);
    }, 520);
    card.addEventListener("pointerup", () => clearTimeout(timer), { once: true });
    card.addEventListener("pointerleave", () => clearTimeout(timer), { once: true });
  });

  byId("batchMove").addEventListener("click", () => openMoveDialog([...selectedIds]));
  byId("batchDelete").addEventListener("click", () => {
    if (confirm("Delete selected memories?")) deleteMedia([...selectedIds]);
  });
  byId("batchClear").addEventListener("click", () => {
    selectedIds.clear();
    renderFolderDialog(currentFolderId);
  });

  byId("viewerPrev").addEventListener("click", () => changeViewer(-1));
  byId("viewerNext").addEventListener("click", () => changeViewer(1));
  byId("editCaptionButton").addEventListener("click", () => openCaptionEditor(currentViewerIds[viewerIndex]));
  byId("toggleCarouselButton").addEventListener("click", () => toggleCarouselInclusion(currentViewerIds[viewerIndex]));
  byId("movePhotoButton").addEventListener("click", () => openMoveDialog([currentViewerIds[viewerIndex]]));
  byId("deletePhotoButton").addEventListener("click", () => {
    if (confirm("Delete this memory?")) deleteMedia([currentViewerIds[viewerIndex]]);
  });

  byId("modeControls").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    state.settings.mode = button.dataset.mode;
    commit();
  });
  byId("folderSourceList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-source-folder]");
    if (!button) return;
    state.settings.selectedFolderId = button.dataset.sourceFolder;
    commit();
  });
  byId("selectedPhotoGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-carousel]");
    if (button) toggleCarouselInclusion(button.dataset.selectCarousel);
  });
  byId("rotationPreview").addEventListener("click", (event) => {
    const button = event.target.closest("[data-reorder]");
    if (button) reorderSelected(button.dataset.reorder, button.dataset.dir);
  });
  byId("autoRotateInput").addEventListener("change", (event) => {
    state.settings.autoRotate = event.target.checked;
    commit();
  });
  byId("showCaptionsInput").addEventListener("change", (event) => {
    state.settings.showCaptions = event.target.checked;
    commit();
  });
  byId("speedInput").addEventListener("input", (event) => {
    state.settings.rotationInterval = Number(event.target.value);
    commit();
  });
  byId("glowInput").addEventListener("input", (event) => {
    state.settings.glowIntensity = Number(event.target.value) / 100;
    commit();
  });

  byId("importFolderList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-import-folder]");
    if (!button) return;
    importTargetFolderId = button.dataset.importFolder;
    renderImport();
  });
  byId("fileInput").addEventListener("change", (event) => importFiles([...event.target.files]));
  byId("connectGoogle").addEventListener("click", () => {
    googleConnected = true;
    byId("importStatus").textContent = "Mock Google Photos connected.";
    renderImport();
  });
  byId("googleAlbums").addEventListener("click", (event) => {
    const button = event.target.closest("[data-google-album]");
    if (!button) return;
    selectedGoogleAlbumId = button.dataset.googleAlbum;
    selectedGoogleIds.clear();
    renderImport();
  });
  byId("googleMediaGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-google-media]");
    if (!button) return;
    const id = button.dataset.googleMedia;
    if (selectedGoogleIds.has(id)) selectedGoogleIds.delete(id);
    else selectedGoogleIds.add(id);
    renderImport();
  });
  byId("importGoogleSelected").addEventListener("click", importGoogleSelected);

  byId("authorYou").addEventListener("click", () => {
    captionAuthor = "You";
    renderCaptionAuthor();
  });
  byId("authorHer").addEventListener("click", () => {
    captionAuthor = "Her";
    renderCaptionAuthor();
  });
  byId("saveCaption").addEventListener("click", saveCaption);
  byId("deleteCaption").addEventListener("click", deleteCaption);

  byId("moveFolderList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-move-folder]");
    if (button) moveMedia(moveTargetIds, button.dataset.moveFolder);
  });

  document.addEventListener("keydown", (event) => {
    if (el.viewerDialog.open && event.key === "ArrowLeft") changeViewer(-1);
    if (el.viewerDialog.open && event.key === "ArrowRight") changeViewer(1);
  });
}

bindEvents();
renderAll();
