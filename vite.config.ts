import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Der Basispfad hängt davon ab, wo die App liegt: GitHub Pages serviert sie
// unter /italy-collection/, GitLab Pages je nach Projekteinstellung unter
// /reiseplaner-app/ oder — bei aktivierter eindeutiger Domain — unter /.
// Die CI setzt BASE_PATH deshalb selbst; hier steht nur der GitHub-Fall.
const base = process.env.BASE_PATH ?? '/italy-collection/'

export default defineConfig({
  base,
  // Statische Dateien liegen in static/, nicht in public/: GitLab Pages
  // erwartet das Bauergebnis in einem Verzeichnis namens public, und beide
  // gleichzeitig wären ein Namenskonflikt.
  publicDir: 'static',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Italien-Kollektion',
        short_name: 'Italien',
        description: 'Reiseführer für Toskana und Südtirol — entscheiden statt suchen.',
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#faf7f2',
        theme_color: '#7a2e2e',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Map tiles are fetched on demand. Cache-first keeps every tile the
        // phone has already rendered available without signal — which is the
        // normal state in the Val d'Orcia and most Dolomite side valleys.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
