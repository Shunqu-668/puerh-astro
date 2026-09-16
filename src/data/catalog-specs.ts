import data from './catalog-specs.json';
import { products } from './products';
export const catalogSpecs = new Map(data.items.map(item => [item.slug, item]));
if (catalogSpecs.size !== products.length || products.some(p => !catalogSpecs.has(p.slug))) {
  throw new Error('Catalogue specifications must match every product.');
}
