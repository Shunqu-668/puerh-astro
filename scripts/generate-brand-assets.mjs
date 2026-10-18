import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { generateFavicon } from './generate-favicon.mjs';
const brand = fileURLToPath(new URL('../public/brand/', import.meta.url));
for (const name of ['logo', 'social-card']) await sharp(brand + name + '.svg').png().toFile(brand + name + '.png');
await sharp(brand + 'favicon.svg').resize(32,32).png().toFile(brand + 'favicon-32.png');
await generateFavicon();
console.log('Exported current website identity for search/share previews.');
