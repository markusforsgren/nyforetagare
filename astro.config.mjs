import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sidor som inte ska finnas i sitemap (inloggning, admin, tack-sidor)
const PRIVATE = ['/admin/', '/foretag/konto/', '/community/chatt/', '/tack/'];

export default defineConfig({
  site: 'https://nyforetagare.se',
  integrations: [sitemap({ filter: (page) => !PRIVATE.some((p) => page.includes(p)) })],
  // Inga inbäddade skript i HTML – krävs för den strikta säkerhetspolicyn (CSP) i netlify.toml
  vite: { build: { assetsInlineLimit: 0 } },
});
