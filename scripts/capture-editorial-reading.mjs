import {chromium} from 'playwright';
import path from 'node:path';
const out=path.resolve('../research/editorial-implementation-20261014/visual');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-proxy-server']});
const page=await browser.newPage({viewport:{width:390,height:950},reducedMotion:'reduce'});
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
for(const [name,route,section] of [
 ['mobile-blog','/blog/shu-i-shen-puer-raznica/','Что сравнивать покупателю'],
 ['mobile-draft','/__review/B09.html','Какие фотографии попросить'],
 ['mobile-custom','/private-label/','Как будет выглядеть ваш чай'],
 ['mobile-review','/__review/','先看供货与定制']]){
 await page.goto('http://127.0.0.1:4322'+route,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:section,exact:true}).scrollIntoViewIfNeeded();
 await page.locator('img[src]').evaluateAll(async images=>{for(const img of images)img.loading='eager';await Promise.all(images.map(img=>img.decode().catch(()=>{})));});
 await page.screenshot({path:path.join(out,name+'.png')});
}
await browser.close();
