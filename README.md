# Safarnama React App

This is a runnable Vite + React version of the uploaded Safarnama prototype.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in your terminal, usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Notes

- The original page components, shared components, tweak panel, and CSS have been preserved in `src/App.jsx` and `src/styles.css`.
- Static uploads and SVG assets are in `public/uploads` and `public/assets`.
- Navigation uses the same hash routing as the source prototype, so routes look like `/#shop`, `/#studio`, etc.
