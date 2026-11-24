import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// /ap is served by Go so guests receive an actual HTTP 404 before HTML/assets.
const adminTarget='http://127.0.0.1:18080';
const ignoredPath=(path:string)=>path.includes('.tmpdir')||path.endsWith('.tmp');
export default defineConfig({plugins:[react(),{name:'protected-local-admin',configureServer(server){server.middlewares.use((req,res,next)=>{const path=(req.url||'').split('?')[0];if(path!='/ap'&&!path.startsWith('/ap/'))return next();const host=req.headers.host||'';if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host)||(req.headers.origin&&req.headers.origin!=='http://'+host)){res.statusCode=404;res.end('Not Found');return;}next();});}}],base:'./',server:{watch:{ignored:ignoredPath},proxy:{'^/ap(?:/|$|\\?)':{target:adminTarget,changeOrigin:true,configure(proxy){proxy.on('proxyReq',(out,req)=>{if(req.headers.origin)out.setHeader('Origin',adminTarget);});}}}}});
