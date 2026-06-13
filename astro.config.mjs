import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import sitemapXsl from './src/integrations/sitemap-xsl.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://puerhdirect.ru',
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = new Date();
        return item;
      },
    }),
    sitemapXsl(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
