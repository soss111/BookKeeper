# BookKeeper

Professional bookkeeping: login, company profile, sales/purchase invoices, clients, reports. Data in browser (localStorage) or Google Drive.

## Run

- **Local:** `npm install` then `npm run dev` (or `./RUN.sh` / `RUN.bat`) → http://localhost:3000
- **Live:** https://soss111.github.io/BookKeeper/
- **Deploy:** From the **bookkeeper-app** folder run `npm run deploy` (updates live site). First time: repo **Settings → Pages** → Source: branch **gh-pages**, folder **/ (root)**.

Repo: [github.com/soss111/BookKeeper](https://github.com/soss111/BookKeeper)

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
