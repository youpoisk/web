import type {ApiClient,ResponseBody} from '../api/client.ts';
export type SimilarVideo=ResponseBody<'getSimilarVideos'>['items'][number];
export const loadSimilar=(client:Pick<ApiClient,'request'>,youtubeId:string,after:string|null,signal?:AbortSignal)=>client.request('getSimilarVideos',{path:{youtube_id:youtubeId},query:{limit:12,...(after?{after}:{})},signal});
export function appendSimilar(previous:SimilarVideo[],incoming:SimilarVideo[]):SimilarVideo[]{const seen=new Set(previous.map(v=>v.id));return [...previous,...incoming.filter(v=>{if(seen.has(v.id))return false;seen.add(v.id);return true;})];}
export function similarDuration(seconds:number|null):string{if(seconds===null)return '';const minutes=Math.floor(seconds/60),rest=String(seconds%60).padStart(2,'0');return minutes+':'+rest;}
