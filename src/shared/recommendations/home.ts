import {toPublicCard,type PublicCard,type SearchSort} from '../library/lists.ts';
import type {RecommendationVideo} from './model.ts';
export type HomeVideo=PublicCard&{siteRecommended:boolean};
/** One visible identity per YouTube ID. The verified source wins duplicate metadata. */
export function mergeHomeVideos(catalog:PublicCard[],recommended:RecommendationVideo[],enabled:boolean,sort:SearchSort):HomeVideo[]{
 const unique=new Map<string,HomeVideo>();
 if(enabled)for(const item of recommended)unique.set(item.youtube_video_id,{...toPublicCard(item),siteRecommended:true});
 for(const item of catalog)if(!unique.has(item.id))unique.set(item.id,{...item,siteRecommended:false});
 const items=[...unique.values()];
 if(sort!=='new')items.sort((a,b)=>{const rating=b.rating-a.rating,votes=b.votes-a.votes;return (sort==='top'?rating||votes:votes||rating)||(a.id<b.id?1:a.id>b.id?-1:0);});
 return items;
}

/** The next reveal adds at most12 beyond the cards actually visible, even after short pages. */
export function nextHomeVisible(visible:number,loaded:number):number{return Math.min(visible,loaded)+12;}
