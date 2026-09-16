import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const brand = fileURLToPath(new URL('../public/brand/', import.meta.url));
for (const name of ['logo', 'social-card']) await sharp(brand + name + '.svg').png().toFile(brand + name + '.png');
await sharp(brand + 'favicon.svg').resize(32,32).png().toFile(brand + 'favicon-32.png');
console.log('Exported current website identity for search/share previews.');
