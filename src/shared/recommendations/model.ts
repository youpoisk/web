import type {ApiClient} from '../api/client.ts';
import type {components} from '../api/schema.d.ts';
export type RecommendationPreferences=components['schemas']['RecommendationPreferences'];
export type RecommendationPage=components['schemas']['SiteRecommendationPage'];
export type RecommendationVideo=RecommendationPage['items'][number];
export type GuestPreferences={show_site_recommendations:boolean;favorite_tags:string[]};
export type StoragePort=Pick<Storage,'getItem'|'setItem'>;
const key='youpoisk-guest-site-recommendations-v1';
const defaults=():GuestPreferences=>({show_site_recommendations:true,favorite_tags:[]});
export function readGuestPreferences(storage?:StoragePort):GuestPreferences{try{const raw=storage?.getItem(key);if(!raw)return defaults();const value=JSON.parse(raw);if(value?.version!==1||typeof value.show_site_recommendations!=='boolean'||!Array.isArray(value.favorite_tags)||value.favorite_tags.length>20||value.favorite_tags.some((tag:unknown)=>typeof tag!=='string'||[...tag].length<1||[...tag].length>100||!/^([\p{L}\p{N}_][\p{L}\p{N}\p{M}_]*)$/u.test(tag)))return defaults();return {show_site_recommendations:value.show_site_recommendations,favorite_tags:[...new Set<string>(value.favorite_tags)]};}catch{return defaults();}}
export function saveGuestPreferences(storage:StoragePort|undefined,value:GuestPreferences):void{if(!storage)throw Error('Локальное хранилище недоступно');storage.setItem(key,JSON.stringify({version:1,...value}));}
export const loadRecommendationPreferences=(client:Pick<ApiClient,'request'>,signal?:AbortSignal)=>client.request('getRecommendationPreferences',{signal});
export const saveRecommendationPreferences=(client:Pick<ApiClient,'request'>,current:RecommendationPreferences,show:boolean,tags:string[])=>client.request('putRecommendationPreferences',{body:{expected_revision:current.revision,show_site_recommendations:show,favorite_tags:tags}});
export function loadRecommendationPage(client:Pick<ApiClient,'request'>,personal:boolean,after:string|null,tags:string[],signal?:AbortSignal){return personal?client.request('listMySiteRecommendations',{query:{limit:12,...(after?{after}:{})},signal}):client.request('listSiteRecommendations',{query:{limit:12,...(after?{after}:{}),...(tags.length?{tag:tags}:{})},signal});}
export const loadRecommendationTags=(client:Pick<ApiClient,'request'>,query:string,after:string|null,signal?:AbortSignal)=>client.request('listRecommendationTags',{query:{limit:12,...(query?{q:query}:{}),...(after?{after}:{})},signal});
export function mergeRecommendationPages(previous:RecommendationVideo[],next:RecommendationVideo[]){const seen=new Set(previous.map(video=>video.id));return [...previous,...next.filter(video=>{if(seen.has(video.id))return false;seen.add(video.id);return true;})];}
