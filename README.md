# BookKeeper

Professional bookkeeping: login, company profile, sales/purchase invoices, clients, reports. Data in browser (localStorage) or **Neon Postgres**.

> **Fix `GET .../src/main.jsx 404`:** GitHub repo → **Settings** → **Pages** → set **Branch** to **gh-pages** (not main) → Save. Then open https://soss111.github.io/BookKeeper/

## Run

- **Local:** `npm install` then `npm run dev` (or `./RUN.sh` / `RUN.bat`) → http://localhost:3000
- **Live:** https://soss111.github.io/BookKeeper/
- **Deploy:** From the **bookkeeper-app** folder run `npm run deploy` (updates live site). First time: repo **Settings → Pages** → Source: branch **gh-pages**, folder **/ (root)**.

Repo: [github.com/soss111/BookKeeper](https://github.com/soss111/BookKeeper)

## Database (Neon)

Use [Neon](https://console.neon.tech) Postgres as the main database:

1. **Neon:** Create a project at [console.neon.tech](https://console.neon.tech) → **Connect** → copy the **Node.js** connection string.
2. **API server:** From the **bookkeeper-app** folder run:
   - `cd server && npm install`
   - Create `server/.env` with `DATABASE_URL=<your Neon connection string>` (see `server/.env.example`).
   - `npm start` (or `npm run dev`) → API on http://localhost:3003
3. **App:** In **Settings** → **Database (Neon)** enter the API URL (e.g. `http://localhost:3003` for local, or your deployed API URL). Load/save will use Neon instead of local storage.

Deploy the API (e.g. Railway, Render, Fly.io) and set `DATABASE_URL` there; then set that API URL in the app.

## Demo

- Email: `demo@bookkeeper.app`  
- Password: `demo`

## In Cursor

Main code: `src/BookkeeperApp.jsx`. Run `npm run dev`; after changes run `npm run deploy`. `.cursor/rules/` has project context.

## If you see `GET .../src/main.jsx 404`

GitHub Pages is serving the **source** (main branch) instead of the **built** app. Fix:

1. Repo → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** choose **gh-pages** (not main), folder **/ (root)**
4. Save, then hard-refresh the app: https://soss111.github.io/BookKeeper/

Always use the full URL with `/BookKeeper/`. Deploy adds `.nojekyll` so GitHub serves files correctly.
