import { fileURLToPath } from 'node:url';

export default function sitemapXsl() {
  return {
    name: 'sitemap-xsl',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const { readdirSync, readFileSync, writeFileSync } = await import('node:fs');
        const { join } = await import('node:path');
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
  };
}
