import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const origin = 'https://puerhdirect.ru';
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
const visible = text => decode(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const readLinks = html => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].flatMap(m => {
  const href = m[1].match(/\bhref="([^"]+)"/)?.[1];
  const imageText = [...m[2].matchAll(/<img\b[^>]*\balt="([^"]*)"[^>]*>/gi)].map(image => decode(image[1])).join(' ').trim();
  return href ? [{href:decode(href), text:visible(m[2]) || imageText}] : [];
});
const slugs = fs.readdirSync(path.join(root, 'src/content/blog')).filter(n=>n.endsWith('.md')).map(n=>n.slice(0,-3));
const urls = new Set(slugs.map(slug=>'/blog/'+slug+'/'));
const incoming = new Map([...urls].map(url=>[url,[]]));
const problems = [];
const report = [];
function fail(route, message) { problems.push({route,message}); }
function local(link, route) {
  let u; try { u=new URL(link.href, origin+route); } catch { fail(route,'Invalid URL '+link.href); return null; }
  if(u.origin!==origin) return null;
  if (!link.text) fail(route,'Internal link has no visible anchor text: '+link.href);
  const target = path.join(dist, decodeURIComponent(u.pathname).slice(1), u.pathname.endsWith('/')?'index.html':'');
  if(!fs.existsSync(target)) fail(route,'Missing link target: '+link.href);
  if (u.searchParams.has('utm_source')) fail(route,'Internal links must not overwrite attribution: '+link.href);
  if(/^(здесь|тут|нажмите|click here)$/i.test(link.text)) fail(route,'Uninformative anchor: '+link.href);
  return u;
}
for(const slug of slugs) {
  const route='/blog/'+slug+'/';
  const html=fs.readFileSync(path.join(dist,'blog',slug,'index.html'),'utf8');
  const body=html.match(/<article\b[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  const related=html.match(/<section\b[^>]*data-related-articles[^>]*>([\s\S]*?)<\/section>/i)?.[1];
  assert.ok(body && related,'Missing article or editorial related section: '+slug);
  const bodyLinks=readLinks(body), relatedLinks=readLinks(related);
  if(relatedLinks.length!==2) fail(route,'Expected two editorial reading suggestions');
  const targets=new Set();
  for(const [kind, links] of [['body',bodyLinks],['related',relatedLinks]]) {
    for(const link of links) {
      const u=local(link,route);if(!u)continue;
      if(kind==='related') {
        if(!urls.has(u.pathname)) fail(route,'Related item is not a published article: '+u.pathname);
        if(u.pathname===route || targets.has(u.pathname)) fail(route,'Self/duplicate related article: '+u.pathname);
        targets.add(u.pathname);
      }
      if(urls.has(u.pathname) && u.pathname!==route) incoming.get(u.pathname).push({from:route,kind,anchor:link.text});
    }
  }
  if(!bodyLinks.some(l=>{try {const u=new URL(l.href,origin+route);return u.origin===origin && ['/catalog/','/sample/','/private-label/','/contact/'].some(p=>u.pathname.startsWith(p));}catch{return false;}})) fail(route,'No contextual product or buying path in article body');
  report.push({route,bodyLinks:bodyLinks.length,relatedTargets:[...targets]});
}
for(const [route,links] of incoming) if(!links.length) fail(route,'No incoming link from another article');
const newFlag=process.argv.indexOf('--new-slug');
if(newFlag>=0) {
  const route='/blog/'+process.argv[newFlag+1]+'/';
  if(!urls.has(route)) fail(route,'New article not in built site');
  else if(!incoming.get(route).some(l=>l.kind==='body')) fail(route,'New article needs a contextual incoming link from an existing article');
}
const result={checkedAt:new Date().toISOString(),articles:slugs.length,relatedLinks:report.reduce((n,x)=>n+x.relatedTargets.length,0),orphanArticles:[...incoming].filter(([,v])=>!v.length).map(([k])=>k),rows:report,incoming:Object.fromEntries(incoming),problems,limits:'Editorial relevance is reviewed by a person/assistant; counts are interface and discovery checks, not a ranking guarantee.'};
fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(root,'artifacts/blog-links-report.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({articles:slugs.length,relatedLinks:result.relatedLinks,orphans:result.orphanArticles.length,problems}));
assert.equal(problems.length,0,'Blog link validation failed');
