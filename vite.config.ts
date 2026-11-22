import{defineConfig}from'vite';import react from'@vitejs/plugin-react';
// Atomic writers (editors/agents) stage files in dot-prefixed *.tmpdir folders;
// watching those locked temp files crashes the dev server with EBUSY.
const ignoredPath=(path:string)=>path.includes('.tmpdir')||path.endsWith('.tmp');
export default defineConfig({plugins:[react()],base:'./',server:{watch:{ignored:ignoredPath}}});
