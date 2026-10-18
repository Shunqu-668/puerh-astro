import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Package the existing approved mark in ICO format; no new logo artwork.
export async function generateFavicon() {
  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  const images = [
    { size: 32, data: await fs.readFile(path.join(publicDir, 'brand/favicon-32.png')) },
    { size: 64, data: await sharp(path.join(publicDir, 'brand/favicon.svg')).resize(64, 64).png().toBuffer() },
  ];
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  for (const [index, { size, data }] of images.entries()) {
    const metadata = await sharp(data).metadata();
    if (metadata.width !== size || metadata.height !== size) throw new Error('Unexpected favicon dimensions');
    const position = 6 + index * 16;
    header[position] = size;
    header[position + 1] = size;
    header.writeUInt16LE(1, position + 4);
    header.writeUInt16LE(32, position + 6);
    header.writeUInt32LE(data.length, position + 8);
    header.writeUInt32LE(offset, position + 12);
    offset += data.length;
  }
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, ...images.map(image => image.data)]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateFavicon();
  console.log('Generated favicon.ico using the existing 32px and 64px brand mark.');
}
