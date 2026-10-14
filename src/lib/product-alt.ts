import {type Product,typeLabels} from '../data/products';
import detailAlts from '../data/product-detail-alts.json';
/** Factual identity only for unseen views; individually reviewed photos have specific descriptions. */
export function productAlt(p:Product):string {
  return `${typeLabels[p.type].ru} «${p.nameRu}», ${p.year} — фотография чая из каталога`;
}
export const productDetailAlts:Record<string,string> = detailAlts;
