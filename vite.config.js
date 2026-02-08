import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// For GitHub Pages: set base to your repo name, e.g. '/bookkeeper-app/'
const repoName = process.env.GITHUB_PAGES_REPO || 'BookKeeper'
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
