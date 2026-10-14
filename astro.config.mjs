import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import sitemapXsl from './src/integrations/sitemap-xsl.mjs';
import productImages from './src/integrations/product-images.mjs';
import readingTables from './src/integrations/reading-tables.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://puerhdirect.ru',
  trailingSlash: 'always',
  markdown: { rehypePlugins: [readingTables] },
  integrations: [
    productImages(),
    sitemap({ filter: page => !new URL(page).pathname.startsWith('/404') }),
    sitemapXsl(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
