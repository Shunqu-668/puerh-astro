import data from '../data/product-image-variants.json';
type Variant = { src: string; width: number; height: number; bytes: number };
type Photo = { originalBytes: number; variants: Variant[]; full: Variant };
export const productImages = data as Record<string, Photo>;
export function responsivePhoto(src: string, thumbnail = false) {
  const photo = productImages[src];
  if (!photo) return undefined;
  const variants = photo.variants.filter(v => thumbnail ? v.width <= 320 : v.width >= Math.min(320, photo.full.width));
  const fallback = variants.find(v => v.width >= (thumbnail ? 160 : 640)) || variants[variants.length - 1];
  return { ...fallback, srcset: variants.map(v => `${v.src} ${v.width}w`).join(', '), full: photo.full };
}
