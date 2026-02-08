# BookKeeper - Professional Bookkeeping System

A comprehensive bookkeeping application with secure login, company profile management, sales invoices, purchase invoices, client management, and financial reporting.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 🏢 **Company Profile** - Complete business information setup
- 📄 **Sales Invoices** - Create and manage customer invoices with VAT
- 📥 **Purchase Invoices** - Track supplier invoices and expenses
- 👥 **Client Management** - Store client details and business info
- 📊 **Financial Reports** - Dashboard, profit/loss, monthly breakdowns
- 💰 **VAT Support** - Flexible VAT rates per invoice (0-100%)
- 💾 **Private Data Storage** - All data is stored securely per user

## Easiest ways to store and run

| Option | What it does | Best for |
|--------|----------------|----------|
| **Run on your computer** | Keep the `bookkeeper-app` folder, double‑click `RUN.bat` (Windows) or run `./RUN.sh` (Mac/Linux). Opens in browser at `http://localhost:3000`. | Daily use, no account needed. |
| **Store on GitHub** | Push the project to a GitHub repo. Code is backed up and you can clone it on any machine. | Backup, version history, use on multiple computers. |
| **Run from GitHub** | Clone the repo, then `npm install` and `npm run dev` (or use `RUN.sh` / `RUN.bat`). | Same app, different computer. |
| **Install as “production” on your PC** | Run `npm run build`, then serve the `dist` folder (e.g. `npx serve dist`). Use the same URL in the browser like a local app. | One-time build, then open the same link whenever you want. |

**Simplest:** Run it on your computer with `RUN.sh` / `RUN.bat` — no install, no GitHub required.  
**Backup + multi‑device:** Put the code on GitHub, then clone and run wherever you need it.  
**Store on GitHub and run from browser:** See below.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

3. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## Demo Account

Try the app with the demo account:

- **Email:** `demo@bookkeeper.app`
- **Password:** `demo`

The demo includes sample data:
- 3 sales invoices with VAT calculations
- 3 purchase invoices
- 3 clients with full details
- Complete company profile

## Building for Production

```bash
npm run build
```
or
```bash
yarn build
```

The build output will be in the `dist/` directory.

**Run the production build on your computer:**  
`npx serve dist` then open the URL shown (e.g. `http://localhost:3000`). You can bookmark it and use it like an installed app.

**Put it on GitHub (store + run elsewhere):**
1. Create a new repo at [github.com](https://github.com/new).
2. In the project folder: `git init`, `git add .`, `git commit -m "BookKeeper app"`, then add the remote and push.
3. On another computer: `git clone <your-repo-url>`, `cd bookkeeper-app`, then `./RUN.sh` or `RUN.bat`.

### Store on GitHub and run from the browser

1. **Create a repo** at [github.com/new](https://github.com/new) (e.g. name it `bookkeeper-app`).
2. **Push your code** (if not already):
   ```bash
   git init
   git add .
   git commit -m "BookKeeper app"
   git remote add origin https://github.com/YOUR_USERNAME/bookkeeper-app.git
   git push -u origin main
   ```
3. **Install and deploy:**
   ```bash
   npm install
   npm run deploy
   ```
4. **Turn on GitHub Pages:** In the repo on GitHub → **Settings** → **Pages** → under "Build and deployment", set **Source** to **Deploy from a branch** → choose branch **gh-pages** and folder **/ (root)** → Save.
5. **Open in browser:** After a minute, go to `https://YOUR_USERNAME.github.io/bookkeeper-app/` (use your GitHub username and repo name).

If your repo name is not `bookkeeper-app`, edit `vite.config.js` and change the `repoName` (or set env `GITHUB_PAGES_REPO`) so the URL path matches.

## Project Structure

```
bookkeeper-app/
├── src/
│   ├── BookkeeperApp.jsx    # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **Browser Storage API** - Data persistence

## IntelliJ IDEA Setup

1. Open IntelliJ IDEA
2. Select "Open" and choose the project folder
3. IntelliJ will automatically detect it as a Node.js project
4. Open Terminal in IntelliJ (Alt+F12 / ⌥F12)
5. Run `npm install`
6. Run `npm run dev`
7. The app will open in your browser

## Features Overview

### Dashboard
- Real-time financial metrics
- Recent invoices and purchases
- Net profit calculations

### Sales Invoices
- Multi-line item invoices
- Customizable VAT rates
- Status tracking (Pending/Paid/Overdue)
- Client auto-complete

### Purchase Invoices
- Track business expenses as invoices
- Supplier management
- VAT calculations
- Due date tracking

### Settings
- Company profile with full details
- Business registration numbers
- Banking information
- Contact details

### Reports
- Monthly profit/loss breakdown
- Profit margin analysis
- Outstanding payments tracking

## License

Private use only.

## Support

For issues or questions, please create an issue in the repository.
