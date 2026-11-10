import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nyforetagare.se',
  // Inga inbäddade skript i HTML – krävs för den strikta säkerhetspolicyn (CSP) i netlify.toml
  vite: { build: { assetsInlineLimit: 0 } },
});
