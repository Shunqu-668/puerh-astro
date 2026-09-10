export interface Product {
  unitWeightGrams: number;
  unitsPerCarton: number;
  year: number;
  type: "ripe" | "raw";
  shape: "cake" | "brick" | "tuocha";
  slug: string;
  nameRu: string;
  nameEn: string;
  imgFile?: string;
  origin?: string;
  treeAge?: "gushu" | "arbor";
  descRu?: string;
  descEn?: string;
  descCn?: string;
}

export const products: Product[] = [
  { year: 1996, type: "ripe", shape: "tuocha", slug: "1996-ripe-puerh-tuocha-yiwulaoshuqingua", unitWeightGrams: 500, unitsPerCarton: 32, nameRu: "Иу Лаошу Цингуа", nameEn: "Yiwu Laoshu Qingua", origin: "Yiwu", treeAge: "gushu" },
  { year: 2004, type: "raw", shape: "cake", slug: "2004-raw-puerh-cake-banzhangshengtai", unitWeightGrams: 357, unitsPerCarton: 84, nameRu: "Баньчжан Шэнтай", nameEn: "Banzhang Shengtai", origin: "Banzhang", treeAge: "gushu" },
  { year: 2005, type: "raw", shape: "cake", slug: "2005-raw-puerh-cake-laochendecha", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Лао Чэнь Дэ Ча", nameEn: "Lao Chen De Cha", origin: "Menghai" },
  { year: 2006, type: "ripe", shape: "brick", slug: "2006-ripe-puerh-brick-laochatou", unitWeightGrams: 500, unitsPerCarton: 41, nameRu: "Лао Ча Тоу", nameEn: "Lao Cha Tou", origin: "Menghai" },
  { year: 2009, type: "ripe", shape: "brick", slug: "2009-ripe-puerh-brick-gongtinggongzhuan", unitWeightGrams: 250, unitsPerCarton: 100, nameRu: "Гунтин Гунчжуань", nameEn: "Gongting Gongzhuan", origin: "Menghai" },
  { year: 2009, type: "ripe", shape: "tuocha", slug: "2009-ripe-puerh-tuocha-longfengchengxiang", unitWeightGrams: 250, unitsPerCarton: 60, nameRu: "Лунфэн Чэнсян", nameEn: "Longfeng Chengxiang", origin: "Lincang" },
  { year: 2011, type: "ripe", shape: "brick", slug: "2011-ripe-puerh-brick-gongtingchazhuan-xiongfeng", unitWeightGrams: 250, unitsPerCarton: 100, nameRu: "Гунтин Чачжуань Сюнфэн", nameEn: "Gongting Chazhuan Xiongfeng", origin: "Menghai" },
  { year: 2012, type: "ripe", shape: "brick", slug: "2012-ripe-puerh-brick-ginseng", unitWeightGrams: 500, unitsPerCarton: 36, nameRu: "Женьшеневый Кирпич", nameEn: "Ginseng Brick", origin: "Yongde" },
  { year: 2012, type: "ripe", shape: "brick", slug: "2012-ripe-puerh-brick-jinzhenbailian", unitWeightGrams: 200, unitsPerCarton: 80, nameRu: "Цзиньчжэнь Байлянь", nameEn: "Jinzhen Bailian", origin: "Menghai" },
  { year: 2012, type: "ripe", shape: "cake", slug: "2012-ripe-puerh-cake-bandaogongcha", unitWeightGrams: 400, unitsPerCarton: 42, nameRu: "Баньдао Гунча", nameEn: "Bandao Gongcha", origin: "Nannuo" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-banzhanggushu-yongfa", unitWeightGrams: 250, unitsPerCarton: 108, nameRu: "Баньчжан Гушу Юнфа", nameEn: "Banzhang Gushu Yongfa", origin: "Banzhang", treeAge: "gushu" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-bingdao-yongfa", unitWeightGrams: 250, unitsPerCarton: 120, nameRu: "Биндао Юнфа", nameEn: "Bingdao Yongfa", origin: "Bingdao", treeAge: "gushu" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-jujube-yongfa", unitWeightGrams: 250, unitsPerCarton: 120, nameRu: "Ююба Юнфа", nameEn: "Jujube Yongfa", origin: "Lincang" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-overlord-gold-yongfa", unitWeightGrams: 250, unitsPerCarton: 120, nameRu: "Оверлорд Голд Юнфа", nameEn: "Overlord Gold Yongfa", origin: "Lincang" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-chenxianggongting", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Чэньсян Гунтин", nameEn: "Chenxiang Gongting", origin: "Menghai" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-chenxiangyiwuyuancha-yongfa", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Чэньсян Иу Юаньча Юнфа", nameEn: "Chenxiang Yiwu Yuancha Yongfa", origin: "Yiwu" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-jinyagongbing-yongfa", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Цзинья Гунбин Юнфа", nameEn: "Jinya Gongbing Yongfa", origin: "Lincang" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-zhangxianggucha-yongfa", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Чжансян Гуча Юнфа", nameEn: "Zhangxiang Gucha Yongfa", origin: "Lincang", treeAge: "gushu" },
  { year: 2013, type: "ripe", shape: "tuocha", slug: "2013-ripe-puerh-tuocha-yongdegushutuocha", unitWeightGrams: 100, unitsPerCarton: 280, nameRu: "Юн Дэ Гушу Точа", nameEn: "Yong De Gushu Tuocha", origin: "Yongde", treeAge: "gushu" },
  { year: 2014, type: "ripe", shape: "cake", slug: "2014-ripe-puerh-cake-gongtinggongpin-tianming", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Гунтин Гунпинь Тяньмин", nameEn: "Gongting Gongpin Tianming", origin: "Menghai" },
  { year: 2016, type: "ripe", shape: "cake", slug: "2016-ripe-puerh-cake-chenyunchenpi-fuguiyuan", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Чэньюнь Чэньпи Фугуйюань", nameEn: "Chenyun Chenpi Fuguiyuan", origin: "Menghai" },
  { year: 2017, type: "raw", shape: "cake", slug: "2017-raw-puerh-cake-bingdaogushu", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Биндао Гушу", nameEn: "Bingdao Gushu", origin: "Bingdao", treeAge: "gushu", imgFile: "2017-raw-puerh-cake-bingdaogushu-0.jpg" },
  { year: 2017, type: "raw", shape: "tuocha", slug: "2017-raw-puerh-tuocha-bulanglongzhu", unitWeightGrams: 500, unitsPerCarton: 20, nameRu: "Булан Лунчжу", nameEn: "Bulang Longzhu", origin: "Bulang", treeAge: "gushu" },
  { year: 2017, type: "ripe", shape: "cake", slug: "2017-ripe-puerh-cake-xiongfeng7571-xiongfeng", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Сюнфэн 7571", nameEn: "Xiongfeng 7571", origin: "Menghai" },
  { year: 2017, type: "ripe", shape: "cake", slug: "2017-ripe-puerh-cake-xiongfengzhencanggongpin-xiongfeng", unitWeightGrams: 357, unitsPerCarton: 42, nameRu: "Сюнфэн Чжэньцан Гунпинь", nameEn: "Xiongfeng Zhencang Gongpin", origin: "Menghai" },
  { year: 2018, type: "raw", shape: "cake", slug: "2018-raw-puerh-cake-bulangchunyun", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Булан Чуньюнь", nameEn: "Bulang Chunyun", origin: "Bulang", treeAge: "arbor" },
  { year: 2018, type: "raw", shape: "cake", slug: "2018-raw-puerh-cake-yiwu", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Иу", nameEn: "Yiwu", origin: "Yiwu", treeAge: "arbor" },
  { year: 2019, type: "ripe", shape: "brick", slug: "2019-ripe-puerh-brick-laochatou-yongfeng", unitWeightGrams: 250, unitsPerCarton: 60, nameRu: "Лао Ча Тоу Юнфэн", nameEn: "Lao Cha Tou Yongfeng", origin: "Lincang" },
  { year: 2020, type: "raw", shape: "cake", slug: "2020-raw-puerh-cake-banzhang", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Баньчжан", nameEn: "Banzhang", origin: "Banzhang", treeAge: "arbor" },
  { year: 2020, type: "raw", shape: "cake", slug: "2020-raw-puerh-cake-bulang", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Булан", nameEn: "Bulang", origin: "Bulang", treeAge: "arbor", imgFile: "1.jpg" },
  { year: 2022, type: "raw", shape: "brick", slug: "2022-raw-puerh-brick-banzhang", unitWeightGrams: 250, unitsPerCarton: 120, nameRu: "Баньчжан Чжуань", nameEn: "Banzhang Brick", origin: "Banzhang", treeAge: "arbor" },
  { year: 2022, type: "raw", shape: "brick", slug: "2022-raw-puerh-brick-yiwujinzhuan", unitWeightGrams: 250, unitsPerCarton: 100, nameRu: "Иу Цзиньчжуань", nameEn: "Yiwu Jinzhuan", origin: "Yiwu", treeAge: "arbor" },
  { year: 2022, type: "ripe", shape: "brick", slug: "2022-ripe-puerh-brick-gongtingchazhuan-fuguiyuan", unitWeightGrams: 250, unitsPerCarton: 100, nameRu: "Гунтин Чачжуань Фугуйюань", nameEn: "Gongting Chazhuan Fuguiyuan", origin: "Menghai" },
  { year: 2022, type: "ripe", shape: "brick", slug: "2022-ripe-puerh-brick-gongtingchazhuan-paperbox-fuguiyuan", unitWeightGrams: 250, unitsPerCarton: 100, nameRu: "Гунтин Чачжуань (коробка)", nameEn: "Gongting Chazhuan Box", origin: "Menghai" },
  { year: 2023, type: "raw", shape: "cake", slug: "2023-raw-puerh-cake-niuqichongtian", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Нюци Чунтянь", nameEn: "Niuqi Chongtian", origin: "Yiwu", treeAge: "gushu", imgFile: "1.jpg" },
  { year: 2023, type: "ripe", shape: "cake", slug: "2023-ripe-puerh-cake-bulangjinya", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Булан Цзинья", nameEn: "Bulang Jinya", origin: "Bulang" },
  { year: 2023, type: "ripe", shape: "cake", slug: "2023-ripe-puerh-cake-gongtingbing", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Гунтин Бин", nameEn: "Gongting Bing", origin: "Menghai" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-black-pearl-xinwen", unitWeightGrams: 250, unitsPerCarton: 60, nameRu: "Чёрный Жемчуг Синьвэнь", nameEn: "Black Pearl Xinwen", origin: "Lincang" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-gongting-xinwen", unitWeightGrams: 250, unitsPerCarton: 78, nameRu: "Гунтин Синьвэнь", nameEn: "Gongting Xinwen", origin: "Menghai" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-panda-xinwen", unitWeightGrams: 250, unitsPerCarton: 60, nameRu: "Панда Синьвэнь", nameEn: "Panda Xinwen", origin: "Lincang" },
  { year: 2024, type: "ripe", shape: "cake", slug: "2024-ripe-puerh-cake-pandabing", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Панда Бин", nameEn: "Panda Bing", origin: "Lincang" },
  { year: 2025, type: "ripe", shape: "cake", slug: "2025-ripe-puerh-cake-niutoubing", unitWeightGrams: 357, unitsPerCarton: 28, nameRu: "Нютоу Бин", nameEn: "Niutou Bing", origin: "Menghai" },
];

export const typeLabels: Record<string, { ru: string; en: string }> = {
  ripe: { ru: "Шу Пуэр", en: "Ripe Puerh" },
  raw: { ru: "Шэн Пуэр", en: "Raw Puerh" },
};

export const shapeLabels: Record<string, { ru: string; en: string }> = {
  cake: { ru: "Блин", en: "Cake" },
  brick: { ru: "Кирпич", en: "Brick" },
  tuocha: { ru: "Точа", en: "Tuocha" },
};

export function getProductImg(p: Product): string {
  let file = p.imgFile || `${p.slug}.jpg`;
  file = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  return `/images/images/products/${p.slug}/${file}`;
}
