import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist'),preview=path.resolve('../research/editorial-implementation-20261014/preview');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.xml':'application/xml'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const isReview=pathname.startsWith('/__review/'),base=isReview?preview:dist;
 let file=path.resolve(base,'.'+(isReview?pathname.slice('/__review'.length):pathname));
 if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.listen(4322,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4322/__review/'));
