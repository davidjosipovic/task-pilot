import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: false, // Bundle all CSS into one file to prevent FOUC
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent code splitting issues
      },
    },
  },
})
