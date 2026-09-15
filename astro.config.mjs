// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Build-time settings come from .env (local builds) or the shell environment.
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

// Canonical URL for sitemap, Open Graph and structured data. SITE_URL wins;
// on Azure App Service WEBSITE_HOSTNAME is set automatically.
const site = env.SITE_URL || (env.WEBSITE_HOSTNAME ? `https://${env.WEBSITE_HOSTNAME}` : 'http://localhost:4321');

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
