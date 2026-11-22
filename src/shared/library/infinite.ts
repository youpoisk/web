/** One request per observer lifetime. Late callbacks after cleanup cannot load
 * another account/route. The React adapter additionally remembers the cursor. */
export function watchMore(target:Element,load:()=>void,create:(notify:(visible:boolean)=>void)=>{observe:(target:Element)=>void;disconnect:()=>void}):()=>void {
 let active=true,requested=false;
 const observer=create(visible=>{if(active&&visible&&!requested){requested=true;load();}});
 observer.observe(target);
 return()=>{active=false;observer.disconnect();};
}
