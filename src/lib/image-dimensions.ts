import sharp from 'sharp';
import { join } from 'node:path';

// Shared across prerendered pages so repeated product photos are inspected once.
const dimensions = new Map<string, Promise<{ width: number; height: number }>>();
export function imageDimensions(asset: string) {
  if (!asset.startsWith('/') || asset.startsWith('//')) return undefined;
  if (!dimensions.has(asset)) {
    dimensions.set(asset, sharp(join(process.cwd(), 'public', asset)).metadata().then(meta => {
      if (!meta.width || !meta.height) throw new Error(`Missing image dimensions: ${asset}`);
      return { width: meta.width, height: meta.height };
    }));
  }
  return dimensions.get(asset)!;
}
