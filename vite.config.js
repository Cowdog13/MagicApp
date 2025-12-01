import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/MagicApp/' : '/',
  server: {
    port: 5175,
    host: true
  }
}))
