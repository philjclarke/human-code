// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical URL for sitemap, Open Graph and structured data. SITE_URL wins;
// on Azure App Service WEBSITE_HOSTNAME is set automatically.
const azureHost = process.env.WEBSITE_HOSTNAME;
const site = process.env.SITE_URL || (azureHost ? `https://${azureHost}` : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/book/thanks'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
