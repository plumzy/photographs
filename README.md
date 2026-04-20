# Lavender Memories

A complete Expo + React Native anniversary memory app with a working carousel, folders, captions, local imports, image compression, and cloud-ready service boundaries.

## Static Web App

Open `index.html` in a browser to run the no-build static version. It includes the working carousel, folders, viewer, captions, moving/deleting, browser photo import, canvas compression at 68% quality, localStorage persistence, and mock Google Photos import flow.

You can host the root folder on GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, or any plain static host.

## Run

```bash
npm install
npm run start
```

The Expo mobile version uses Expo Router, Zustand, Reanimated, Expo Image, FileSystem, Image Manipulator, and Image Picker.

## Implemented

- Static web app entry with `index.html`, `web/styles.css`, and `web/app.js`
- Auto-rotating hero carousel with manual swipes, infinite loop, pause/play, captions, glow, and source modes
- Folder grid and folder detail screens
- Full-screen media viewer with swipe, caption editing, moving, deleting, and carousel inclusion
- Batch select, move, and delete in folder detail
- Import flow for device photos and mock Google Photos albums
- Real compression pipeline at 68% quality with separate thumbnails
- Storage adapter, media repository, sync service, local cache service, and Google Photos service interfaces
- Lavender glassmorphism UI with subtle tulip accents
