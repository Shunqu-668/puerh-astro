import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Derivatives are reproducible; source photographs are never overwritten.
export default function productImages() {
  return {
    name: 'product-images',
    hooks: {
      'astro:config:setup': async ({ config, command, addWatchFile, logger }) => {
        if (!['build', 'dev', 'sync'].includes(command)) return;
        const root = fileURLToPath(config.root);
        const publicDir = path.resolve(fileURLToPath(config.publicDir));
        const galleryFile = path.join(root, 'src/data/product-gallery.json');
        addWatchFile(galleryFile);
        const gallery = JSON.parse(await fs.readFile(galleryFile, 'utf8'));
        const sources = new Set(Object.values(gallery).flat());
        async function collect(dir) {
          for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            const filename = path.join(dir, entry.name);
            if (entry.isDirectory()) await collect(filename);
            else if (entry.name.endsWith('.webp')) sources.add('/' + path.relative(publicDir, filename).split(path.sep).join('/'));
          }
        }
        await collect(path.join(publicDir, 'images/images/products'));
        const out = path.join(publicDir, 'images/optimized-products');
        await fs.mkdir(out, { recursive: true });
        const manifest = {};
        for (const src of [...sources].sort()) {
          const input = path.resolve(publicDir, '.' + src);
          if (!input.startsWith(publicDir + path.sep)) throw new Error(`Invalid product image path: ${src}`);
          const buffer = await fs.readFile(input);
          const meta = await sharp(buffer).metadata();
          const hash = createHash('sha256').update(buffer).update('webp-v1-82-90').digest('hex').slice(0, 20);
          const variants = [];
          for (const width of [...new Set([160, 320, 640, 960, 1280].filter(w => w < meta.width).concat(meta.width))]) {
            const name = `${hash}-${width}.webp`;
            const filename = path.join(out, name);
            try { await fs.access(filename); }
            catch {
              await fs.writeFile(filename, await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer());
            }
            const size = await sharp(filename).metadata();
            variants.push({ src: `/images/optimized-products/${name}`, width: size.width, height: size.height, bytes: (await fs.stat(filename)).size });
          }
          // Full native resolution is reserved for opening the detail viewer.
          const fullName = `${hash}-detail.webp`;
          const fullPath = path.join(out, fullName);
          try { await fs.access(fullPath); }
          catch { await fs.writeFile(fullPath, await sharp(buffer).rotate().webp({ quality: 90, effort: 5 }).toBuffer()); }
          const fullMeta = await sharp(fullPath).metadata();
          const fullBytes = (await fs.stat(fullPath)).size;
          const keepOriginal = src.endsWith('.webp') || fullBytes >= buffer.length;
          manifest[src] = { originalBytes: buffer.length, variants, full: { src: keepOriginal ? src : `/images/optimized-products/${fullName}`, width: fullMeta.width, height: fullMeta.height, bytes: keepOriginal ? buffer.length : fullBytes } };
        }
        const manifestPath = path.join(root, 'src/data/product-image-variants.json');
        const contents = JSON.stringify(manifest, null, 2) + '\n';
        let previous;
        try { previous = await fs.readFile(manifestPath, 'utf8'); } catch {}
        if (previous !== contents) await fs.writeFile(manifestPath, contents);
        logger.info(`Prepared responsive photographs: ${sources.size} images (originals retained).`);
      },
    },
  };
}
