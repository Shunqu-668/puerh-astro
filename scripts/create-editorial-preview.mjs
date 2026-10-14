import fs from 'node:fs';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
const project=path.resolve('..');
const dest=path.join(project,'research/editorial-implementation-20261014/preview');
fs.mkdirSync(dest,{recursive:true});
const md=await createMarkdownProcessor();
const css=`*{box-sizing:border-box}body{margin:0;background:#111718;color:#eee7dc;font:17px/1.8 system-ui,Arial,sans-serif}main{max-width:1000px;margin:auto;padding:48px 24px}h1{font-size:clamp(28px,4vw,40px);line-height:1.3}h2{margin-top:42px;font-size:25px}a{color:#e6b87f;text-underline-offset:4px}li{margin:10px 0}.notice{border-left:3px solid #be8e55;padding:16px 22px;background:#1c2628}.paper{background:#f4efe6;color:#292725;padding:clamp(22px,5vw,64px);border-radius:5px}.paper a{color:#825023}.paper p{max-width:72ch}.paper table{display:block;overflow-x:auto;border-collapse:collapse;font-size:16px}.paper td,.paper th{border:1px solid #cbc3b6;padding:12px;text-align:left;min-width:170px}.paper th{background:#e7dfd2}.paper img{width:100%;max-height:460px;object-fit:contain;background:#e8e1d6}figcaption{font-size:14px;color:#665e55}.back{display:inline-block;margin-bottom:25px}small{color:#b9b6af}a:focus-visible{outline:3px solid #c48d42;outline-offset:4px}@media(max-width:600px){main{padding:24px 14px}.paper{padding:24px 18px}body{font-size:16px}}`;
function doc(title,body,lang='zh-CN'){return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · 本地审阅</title><style>${css}</style></head><body><main>${body}</main></body></html>`;}
const drafts=[['B05','B05-stoimost-partii-puera.md','整批报价与成本比较','/images/images/fangcun-store.webp','Упакованные коробки с маркировкой перед отправкой','Коробки из материалов PUERH DIRECT. Укладка и масса груза уточняются для выбранного заказа.'],['B09','B09-dannye-dlya-kartochki-puera.md','平台卖家要向供应商索取什么资料','/images/product-details/2023-ripe-puerh-cake-bulangjinya/ff8d57fb415c513b.jpg','Маркировка на упаковке шу Булан Цзинья 2023','Фотография маркировки из каталога. Для карточки нужна упаковка именно выбранного товара.']];
for(const [id,file,zh,img,alt,caption] of drafts){
 const raw=fs.readFileSync(path.join(project,'research/content-program/drafts',file),'utf8');
 const title=raw.match(/^title: "(.+)"$/m)[1];
 const body=raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 const result=await md.render(body);
 fs.writeFileSync(path.join(dest,id+'.html'),doc(title,`<a class="back" href="./">← 返回本批审阅</a><p class="notice">${id} · ${zh}。完整俄语新稿，本地待审，未发布。</p><article class="paper"><h1>${title}</h1><figure><img src="${img}" alt="${alt}"><figcaption>${caption}</figcaption></figure>${result.code}</article>`,'ru'));
}
const products=Object.keys(JSON.parse(fs.readFileSync('src/data/product-detail-alts.json','utf8')));
// Read the curated product guidance keys, not photo filenames.
const slugs=[...fs.readFileSync('src/data/buyer-notes.ts','utf8').matchAll(/^  '([^']+)':/gm)].map(x=>x[1]);
const body=`<small>PUERH DIRECT · 2026年10月14日</small><h1>本批内容优化，直接看页面</h1><p class="notice">这是本地审阅版，正式网站尚未更新。原42款商品、现有URL和暗色品牌风格保留；博客沿用浅底阅读区。以下链接均指向这次构建。</p><h2>先看供货与定制</h2><ul><li><a href="/">首页：找茶、持续供应与包装定制</a></li><li><a href="/catalog/">目录：供货优势与现有42款</a></li><li><a href="/private-label/">定制：选茶—样品—版面—重复生产</a></li><li><a href="/about/">关于我们：现有仓储、选茶和生产资源</a></li></ul><h2>三篇完整改写</h2><ul><li><a href="/blog/proizvodstvo-puera-ot-lista-do-blina/">从叶片到茶饼：加工过程怎样影响采购</a></li><li><a href="/blog/shu-i-shen-puer-raznica/">生普与熟普：怎么选、怎么比较</a></li><li><a href="/blog/khranenie-puera-usloviya-vyderzhki/">茶店仓储：收货、气味、包装与批次</a></li></ul><h2>六款代表商品</h2><p>按现有规格补充采购用途、比较方法、复购识别；这不是热销榜，也不代表新增库存承诺。</p><ul>${slugs.map(s=>`<li><a href="/catalog/product/${s}/">${s}</a></li>`).join('')}</ul><h2>补齐的两篇新稿</h2><ul>${drafts.map(([id,,zh])=>`<li><a href="${id}.html">${id} · ${zh}</a> — 完整正文，未加入生产站</li>`).join('')}</ul><p>每3天博客任务已经建立，先交付草稿与核证；不把自动写稿等同自动发布。今后已完成与待处理分别记录。</p><h2>核验范围</h2><p>图片ALT按真实图像补充；42款商品共用描述、6款22张细节照片逐张核对。龙珠目录“500克”保留为待核包装规格，不写成单颗重量。新稿和改写不补造价格、库存、证书或品鉴经历。</p><p>本地内容和技术检查通过不等于已获得收录。Google本次63个网址检查：6已收录、33已发现、1已抓取未索引、23未知；真实爬虫访问原因仍待日志闭环。</p>`;
fs.writeFileSync(path.join(dest,'index.html'),doc('整批优化审阅',body));
console.log('Created review landing and two complete article previews.');
