import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
    {
      name: 'sitemap-xsl',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const distDir = fileURLToPath(dir);
          const files = readdirSync(distDir).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
          for (const file of files) {
            const path = join(distDir, file);
            let xml = readFileSync(path, 'utf-8');
            if (!xml.includes('xml-stylesheet')) {
              xml = xml.replace('?>', '?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
              writeFileSync(path, xml);
            }
          }
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
