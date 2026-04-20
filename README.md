# Lavender Memories

A complete Expo + React Native anniversary memory app with a working carousel, folders, captions, local imports, image compression, and cloud-ready service boundaries.

## Static Web App

Open `index.html` in a browser to run the no-build static version. It includes the working carousel, folders, viewer, captions, moving/deleting, browser photo import, canvas compression at 68% quality, localStorage persistence, live Google Photos Picker import, and Cloudflare R2-ready storage sync.

You can host the root folder on GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, or any plain static host.

## Run

```bash
npm install
npm run start
```

The Expo mobile version uses Expo Router, Zustand, Reanimated, Expo Image, FileSystem, Image Manipulator, and Image Picker.

## Cloudflare R2 Storage

The GitHub Pages app cannot safely store Cloudflare R2 access keys in browser code. The repo includes a Cloudflare Worker in `cloudflare-worker/src/index.js` that receives compressed app images and writes them to R2 through a bucket binding.

### Cloudflare setup

1. In Cloudflare, use your R2 bucket named `photographs`.
2. Create a Worker and use the code in `cloudflare-worker/src/index.js`.
3. Bind the `photographs` R2 bucket to the Worker with variable name `MEMORIES_BUCKET`.
4. Add Worker variables:
   - `ALLOWED_ORIGIN=https://plumzy.github.io`
   - `SYNC_KEY=<choose a private sync key>`
   - Optional `PUBLIC_R2_BASE_URL=<your public R2/custom domain base URL>`
   - Optional `PUBLIC_READ=true` only if Worker-served image reads should be public.
5. Deploy the Worker.
6. Open the app, go to Settings, find `Cloudflare R2 storage`, paste the Worker URL and the same sync key, then click `Save storage`.
7. Use `Sync existing memories` to upload already-imported compressed photos, or enable `Auto-sync new imported photos`.

The app uploads only compressed local app images, including Google Photos imports after the app compression pipeline runs. Demo images loaded from remote URLs are skipped until they are imported into app storage.

Optional Wrangler deployment files are included in `cloudflare-worker/wrangler.toml.example`. Cloudflare's R2 Worker binding docs: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/

## Implemented

- Static web app entry with `index.html`, `web/styles.css`, and `web/app.js`
- Auto-rotating hero carousel with manual swipes, infinite loop, pause/play, captions, glow, and source modes
- Folder grid and folder detail screens
- Full-screen media viewer with swipe, caption editing, moving, deleting, and carousel inclusion
- Batch select, move, and delete in folder detail
- Import flow for device photos and live Google Photos Picker imports
- Real compression pipeline at 68% quality with separate thumbnails
- Cloudflare R2 sync through a Worker, with manual sync and optional auto-sync
- Storage adapter, media repository, sync service, local cache service, and Google Photos service interfaces
- Lavender glassmorphism UI with subtle tulip accents
