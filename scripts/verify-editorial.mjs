import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const out=path.resolve('../research/editorial-implementation-20261014/visual');
fs.mkdirSync(out,{recursive:true});
const slugs=[...fs.readFileSync('src/data/buyer-notes.ts','utf8').matchAll(/^  '([^']+)':/gm)].map(x=>x[1]);
const routes=['/__review/','/','/catalog/','/about/','/private-label/','/blog/proizvodstvo-puera-ot-lista-do-blina/','/blog/shu-i-shen-puer-raznica/','/blog/khranenie-puera-usloviya-vyderzhki/',...slugs.map(s=>'/catalog/product/'+s+'/'),'/__review/B05.html','/__review/B09.html'];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-proxy-server']});
const context=await browser.newContext({reducedMotion:'reduce'});
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const rows=[];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 for(const [i,route] of routes.entries()){
  const response=await page.goto('http://127.0.0.1:4322'+route,{waitUntil:'networkidle'});
  assert.equal(response.status(),200,route);
  await page.locator('img[src]').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));});
  const data=await page.evaluate(()=>({title:document.title,overflow:document.documentElement.scrollWidth>innerWidth+1,missingAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,broken:[...document.images].filter(i=>i.hasAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src'))}));
  assert.equal(data.overflow,false,route);assert.equal(data.missingAlt,0,route);assert.deepEqual(data.broken,[],route);
  await page.screenshot({path:path.join(out,`${width}-${String(i).padStart(2,'0')}.png`),fullPage:true});
  rows.push({width,route,...data});
 }
}
await page.goto('http://127.0.0.1:4322/catalog/product/'+slugs[0]+'/');
const thumbs=page.locator('[data-gallery-image]');
const galleryCount=await thumbs.count();
for(let i=0;i<galleryCount;i++){
 const expected=await thumbs.nth(i).getAttribute('data-alt');await thumbs.nth(i).click();
 assert.equal(await page.locator('.product-image-open img').getAttribute('alt'),expected);
 await page.locator('.product-image-open').click();
 assert.equal(await page.locator('.image-detail img').getAttribute('alt'),expected);
 await page.keyboard.press('Escape');
}
assert.deepEqual(errors,[]);
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({at:new Date().toISOString(),browser:'Installed Google Chrome, headless; not IAB',rows,galleryAlt:`${galleryCount} main/detail alt transitions verified`,externalRequestsSent:0,pageErrors:errors},null,2));
await browser.close();console.log(JSON.stringify({rendered:rows.length,galleryAlt:'passed',errors}));
