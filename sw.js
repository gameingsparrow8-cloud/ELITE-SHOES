const CACHE='elite-shoes-v1.0.2';
const ASSETS=['./app.html','./manifest.json','./version.json'];
const CATEGORIES=['Sports Shoes','Running Shoes','Walking Shoes','Casual Shoes','Formal Shoes','School Shoes','Sandals','Slippers','Flip Flops','Boots','Heels','Kids Footwear','Men Footwear','Women Footwear','Other'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(async r=>{if(new URL(e.request.url).pathname.endsWith('/app.html')){let t=await r.text();t=t.replace('<input name="cat">','<select name="cat">'+CATEGORIES.map(x=>'<option value="'+x+'">'+x+'</option>').join('')+'</select>');r=new Response(t,{status:r.status,statusText:r.statusText,headers:r.headers})}const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request))) });
