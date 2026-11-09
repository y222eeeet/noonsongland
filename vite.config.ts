import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { guestbook } from './server/guestbook.mjs'

export default defineConfig({
  plugins: [react(), guestbook()],
})
