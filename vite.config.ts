import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-192.png', 'logo-512.png'],
      manifest: {
        id: 'bjj',
        name: 'BJJ Amigo',
        short_name: 'BJJ',
        description: 'A journal and technique tracker for Brazilian Jiu-Jitsu.',
        theme_color: '#2e9fd0',
        background_color: '#2e9fd0',
        display: 'fullscreen',
        orientation: 'portrait',
        start_url: '.',
        lang: 'en-US',
        dir: 'ltr',
        categories: ['sports', 'health', 'fitness'],
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/bjj/',
})
