// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tarikdsm.github.io',
  base: '/Site_allcanci',
  integrations: [sitemap()],
});
