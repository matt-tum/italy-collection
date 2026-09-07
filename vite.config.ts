import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages under /italy-collection/.
// Override with BASE_PATH=/ for local static hosting.
const base = process.env.BASE_PATH ?? '/italy-collection/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
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
