import data from './catalog-specs.json';
import { products, typeLabels, type Product } from './products';
export const catalogSpecs = new Map(data.items.map(item => [item.slug, item]));
if (data.items.length !== products.length || catalogSpecs.size !== products.length || products.some(p => !catalogSpecs.has(p.slug))) {
  throw new Error('Catalogue specifications must match every product.');
}
for (const product of products) {
  const spec = catalogSpecs.get(product.slug)!;
  if (!Number.isInteger(spec.grams) || spec.grams <= 0 || !Number.isInteger(spec.cartonUnits) || spec.cartonUnits <= 0
    || spec.source !== `https://puerhdirect.com/catalog/${product.slug}/` || !Number.isFinite(Date.parse(spec.sourceDate))) {
    throw new Error(`Invalid or untraceable catalogue specifications: ${product.slug}`);
  }
}

/** Buyer-visible inquiry context, from the same facts as the product page.
 * Carton size is deliberately not presented as a minimum order quantity.
 */
export function productInquiryLabel(product: Product): string {
  const spec = catalogSpecs.get(product.slug);
  if (!spec) throw new Error(`Missing inquiry specifications: ${product.slug}`);
  return `${product.nameRu} · ${product.year} · ${typeLabels[product.type].ru} · ${spec.grams} г`;
}
