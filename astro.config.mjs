// @ts-check
import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  env: {
    schema: {
      API_TOKEN: envField.string({ context: 'server', access: 'secret' })
    }
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
})
