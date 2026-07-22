# Safarnama React App

This is a runnable Vite + React version of the uploaded Safarnama prototype.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in your terminal, usually `http://localhost:5173`.

## Run With Backend

The backend is in `backend/` and is separate from the React frontend.

1. Create backend env:

```bash
cp backend/.env.example backend/.env
```

2. Start backend:

```bash
npm run dev:server
```

3. Start frontend in another terminal:

```bash
npm run dev
```

The frontend calls `http://localhost:8787` by default. Override it with:

```env
VITE_API_BASE_URL=http://localhost:8787
```

No local DB setup is required for testing right now. The backend writes local development data to `backend/data/db.json`.

For completed Shopify purchases, configure Shopify webhooks to point to the backend:

```text
POST /api/shopify/webhooks/orders-paid
POST /api/shopify/webhooks/orders-create
```

See `backend/README.md` for webhook tunnel setup and future Supabase table structure.

## Build

```bash
npm run build
npm run preview
```

## Notes

- The original page components, shared components, tweak panel, and CSS have been preserved in `src/App.jsx` and `src/styles.css`.
- Static uploads and SVG assets are in `public/uploads` and `public/assets`.
- Navigation uses the same hash routing as the source prototype, so routes look like `/#shop`, `/#studio`, etc.
