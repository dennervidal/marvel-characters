/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { getViteConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

export default getViteConfig(
  {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}']
    }
  },
  {
    output: 'static',
    configFile: false
  }
)
