type Ports={read:()=>Promise<void>;visible:()=>boolean;now:()=>number;later:(run:()=>void,delay:number)=>unknown;cancel:(timer:unknown)=>void};
/** Adaptive polling changes delivery latency only; it never marks data read itself. */
export function createChatPolling(p:Ports){let closed=false,busy=false,again=false,timer:unknown=null,lastActivity=p.now();
 function clear(){if(timer!==null){p.cancel(timer);timer=null}}
 function schedule(){clear();if(closed||!p.visible()||busy)return;const idle=Math.max(0,p.now()-lastActivity);timer=p.later(()=>{timer=null;refresh()},idle<60000?15000:idle<180000?30000:60000)}
 async function run(){busy=true;try{await p.read()}catch{/* the view owns safe error messages */}finally{busy=false;if(!closed){if(again){again=false;refresh()}else schedule()}}}
 function refresh(){clear();if(closed||!p.visible())return;if(busy){again=true;return};void run()}
 refresh();return{refresh,activity(){if(closed)return;lastActivity=p.now();schedule()},close(){closed=true;clear()}};
}
