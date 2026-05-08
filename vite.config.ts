import path from "path"

import react from "@vitejs/plugin-react"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    ...(mode === 'development' ? [inspectAttr()] : []),
    react(),
  ],
  server: {
    host: "::",
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
