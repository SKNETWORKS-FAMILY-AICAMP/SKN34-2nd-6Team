import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 레포 루트 .env 하나만 사용 (VITE_* / 백엔드 변수 공유)
  envDir: path.resolve(__dirname, '..'),
  server: {
    port: 5173,
    strictPort: true,
  },
})
