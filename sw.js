const CACHE='elite-shoes-v1.4.7';
const ASSETS=['./manifest.json','./version.json','./sw.js'];
async function prepareApp(){const r=await fetch('./app.html',{cache:'no-store'});let t=await r.text();
// The original dashboard used the low-stock count for the red Stock badge. Replace that exact assignment with total remaining pairs.
t=t.replace(/\$\('lb'\)\.textContent=low/g,"$('lb').textContent=qty");
// Also patch any equivalent assignment if the source was reformatted.
t=t.replace(/\$\('lb'\)\.textContent\s*=\s*low\s*;/g,"$('lb').textContent=qty;");
// Add a direct real-time updater after the app script. This reads the same localStorage data as the app and updates the badge every 250ms.
const patch=`<script>(function(){function syncEliteStock(){try{const d=JSON.parse(localStorage.getItem('elite_shoes')||'{}');const p=Array.isArray(d.products)?d.products:[];const qty=p.reduce((n,x)=>n+(Number(x.qty)||0),0);const low=p.filter(x=>(Number(x.qty)||0)<=3).length;const b=document.getElementById('lb');if(b)b.textContent=qty;const l=document.getElementById('lt');if(l)l.textContent=low+' items low on stock';const dn=document.getElementById('dn');if(dn)dn.textContent=qty;}catch(e){}}window.addEventListener('load',function(){syncEliteStock();setInterval(syncEliteStock,250)});window.addEventListener('storage',syncEliteStock);})();</script>`;
if(!t.includes('syncEliteStock'))t=t.replace('</body>',patch+'</body>');
return new Response(t,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'}})}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(x=>fetch(x,{cache:'no-store'}).then(r=>c.put(x,r))));await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/app.html')){e.respondWith(prepareApp());return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp));return r}))) });