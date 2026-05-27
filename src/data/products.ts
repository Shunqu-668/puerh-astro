export interface Product {
  year: number;
  type: "ripe" | "raw";
  shape: "cake" | "brick" | "tuocha";
  slug: string;
  nameRu: string;
  nameEn: string;
  imgFile?: string;
}

export const products: Product[] = [
  { year: 1996, type: "ripe", shape: "tuocha", slug: "1996-ripe-puerh-tuocha-yiwulaoshuqingua", nameRu: "Иу Лаошу Цингуа", nameEn: "Yiwu Laoshu Qingua" },
  { year: 2004, type: "raw", shape: "cake", slug: "2004-raw-puerh-cake-banzhangshengtai", nameRu: "Баньчжан Шэнтай", nameEn: "Banzhang Shengtai" },
  { year: 2005, type: "raw", shape: "cake", slug: "2005-raw-puerh-cake-laochendecha", nameRu: "Лао Чэнь Дэ Ча", nameEn: "Lao Chen De Cha" },
  { year: 2006, type: "ripe", shape: "brick", slug: "2006-ripe-puerh-brick-laochatou", nameRu: "Лао Ча Тоу", nameEn: "Lao Cha Tou" },
  { year: 2009, type: "ripe", shape: "brick", slug: "2009-ripe-puerh-brick-gongtinggongzhuan", nameRu: "Гунтин Гунчжуань", nameEn: "Gongting Gongzhuan" },
  { year: 2009, type: "ripe", shape: "tuocha", slug: "2009-ripe-puerh-tuocha-longfengchengxiang", nameRu: "Лунфэн Чэнсян", nameEn: "Longfeng Chengxiang" },
  { year: 2011, type: "ripe", shape: "brick", slug: "2011-ripe-puerh-brick-gongtingchazhuan-xiongfeng", nameRu: "Гунтин Чачжуань Сюнфэн", nameEn: "Gongting Chazhuan Xiongfeng" },
  { year: 2012, type: "ripe", shape: "brick", slug: "2012-ripe-puerh-brick-ginseng", nameRu: "Женьшеневый Кирпич", nameEn: "Ginseng Brick" },
  { year: 2012, type: "ripe", shape: "brick", slug: "2012-ripe-puerh-brick-jinzhenbailian", nameRu: "Цзиньчжэнь Байлянь", nameEn: "Jinzhen Bailian" },
  { year: 2012, type: "ripe", shape: "cake", slug: "2012-ripe-puerh-cake-bandaogongcha", nameRu: "Баньдао Гунча", nameEn: "Bandao Gongcha" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-banzhanggushu-yongfa", nameRu: "Баньчжан Гушу Юнфа", nameEn: "Banzhang Gushu Yongfa" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-bingdao-yongfa", nameRu: "Биндао Юнфа", nameEn: "Bingdao Yongfa" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-jujube-yongfa", nameRu: "Ююба Юнфа", nameEn: "Jujube Yongfa" },
  { year: 2013, type: "ripe", shape: "brick", slug: "2013-ripe-puerh-brick-overlord-gold-yongfa", nameRu: "Оверлорд Голд Юнфа", nameEn: "Overlord Gold Yongfa" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-chenxianggongting", nameRu: "Чэньсян Гунтин", nameEn: "Chenxiang Gongting" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-chenxiangyiwuyuancha-yongfa", nameRu: "Чэньсян Иу Юаньча Юнфа", nameEn: "Chenxiang Yiwu Yuancha Yongfa" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-jinyagongbing-yongfa", nameRu: "Цзинья Гунбин Юнфа", nameEn: "Jinya Gongbing Yongfa" },
  { year: 2013, type: "ripe", shape: "cake", slug: "2013-ripe-puerh-cake-zhangxianggucha-yongfa", nameRu: "Чжансян Гуча Юнфа", nameEn: "Zhangxiang Gucha Yongfa" },
  { year: 2013, type: "ripe", shape: "tuocha", slug: "2013-ripe-puerh-tuocha-yongdegushutuocha", nameRu: "Юн Дэ Гушу Точа", nameEn: "Yong De Gushu Tuocha" },
  { year: 2014, type: "ripe", shape: "cake", slug: "2014-ripe-puerh-cake-gongtinggongpin-tianming", nameRu: "Гунтин Гунпинь Тяньмин", nameEn: "Gongting Gongpin Tianming" },
  { year: 2016, type: "ripe", shape: "cake", slug: "2016-ripe-puerh-cake-chenyunchenpi-fuguiyuan", nameRu: "Чэньюнь Чэньпи Фугуйюань", nameEn: "Chenyun Chenpi Fuguiyuan" },
  { year: 2017, type: "raw", shape: "cake", slug: "2017-raw-puerh-cake-bingdaogushu", nameRu: "Биндао Гушу", nameEn: "Bingdao Gushu", imgFile: "2017-raw-puerh-cake-bingdaogushu-0.jpg" },
  { year: 2017, type: "raw", shape: "tuocha", slug: "2017-raw-puerh-tuocha-bulanglongzhu", nameRu: "Булан Лунчжу", nameEn: "Bulang Longzhu" },
  { year: 2017, type: "ripe", shape: "cake", slug: "2017-ripe-puerh-cake-xiongfeng7571-xiongfeng", nameRu: "Сюнфэн 7571", nameEn: "Xiongfeng 7571" },
  { year: 2017, type: "ripe", shape: "cake", slug: "2017-ripe-puerh-cake-xiongfengzhencanggongpin-xiongfeng", nameRu: "Сюнфэн Чжэньцан Гунпинь", nameEn: "Xiongfeng Zhencang Gongpin" },
  { year: 2018, type: "raw", shape: "cake", slug: "2018-raw-puerh-cake-bulangchunyun", nameRu: "Булан Чуньюнь", nameEn: "Bulang Chunyun" },
  { year: 2018, type: "raw", shape: "cake", slug: "2018-raw-puerh-cake-yiwu", nameRu: "Иу", nameEn: "Yiwu" },
  { year: 2019, type: "ripe", shape: "brick", slug: "2019-ripe-puerh-brick-laochatou-yongfeng", nameRu: "Лао Ча Тоу Юнфэн", nameEn: "Lao Cha Tou Yongfeng" },
  { year: 2020, type: "raw", shape: "cake", slug: "2020-raw-puerh-cake-banzhang", nameRu: "Баньчжан", nameEn: "Banzhang" },
  { year: 2020, type: "raw", shape: "cake", slug: "2020-raw-puerh-cake-bulang", nameRu: "Булан", nameEn: "Bulang", imgFile: "1.jpg" },
  { year: 2022, type: "raw", shape: "brick", slug: "2022-raw-puerh-brick-banzhang", nameRu: "Баньчжан Чжуань", nameEn: "Banzhang Brick" },
  { year: 2022, type: "raw", shape: "brick", slug: "2022-raw-puerh-brick-yiwujinzhuan", nameRu: "Иу Цзиньчжуань", nameEn: "Yiwu Jinzhuan" },
  { year: 2022, type: "ripe", shape: "brick", slug: "2022-ripe-puerh-brick-gongtingchazhuan-fuguiyuan", nameRu: "Гунтин Чачжуань Фугуйюань", nameEn: "Gongting Chazhuan Fuguiyuan" },
  { year: 2022, type: "ripe", shape: "brick", slug: "2022-ripe-puerh-brick-gongtingchazhuan-paperbox-fuguiyuan", nameRu: "Гунтин Чачжуань (коробка)", nameEn: "Gongting Chazhuan Box" },
  { year: 2023, type: "raw", shape: "cake", slug: "2023-raw-puerh-cake-niuqichongtian", nameRu: "Нюци Чунтянь", nameEn: "Niuqi Chongtian", imgFile: "1.jpg" },
  { year: 2023, type: "ripe", shape: "cake", slug: "2023-ripe-puerh-cake-bulangjinya", nameRu: "Булан Цзинья", nameEn: "Bulang Jinya" },
  { year: 2023, type: "ripe", shape: "cake", slug: "2023-ripe-puerh-cake-gongtingbing", nameRu: "Гунтин Бин", nameEn: "Gongting Bing" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-black-pearl-xinwen", nameRu: "Чёрный Жемчуг Синьвэнь", nameEn: "Black Pearl Xinwen" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-gongting-xinwen", nameRu: "Гунтин Синьвэнь", nameEn: "Gongting Xinwen" },
  { year: 2024, type: "ripe", shape: "brick", slug: "2024-ripe-puerh-brick-panda-xinwen", nameRu: "Панда Синьвэнь", nameEn: "Panda Xinwen" },
  { year: 2024, type: "ripe", shape: "cake", slug: "2024-ripe-puerh-cake-pandabing", nameRu: "Панда Бин", nameEn: "Panda Bing" },
  { year: 2025, type: "ripe", shape: "cake", slug: "2025-ripe-puerh-cake-niutoubing", nameRu: "Нютоу Бин", nameEn: "Niutou Bing" },
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
  const file = p.imgFile || `${p.slug}.jpg`;
  return `/images/images/products/${p.slug}/${file}`;
}
