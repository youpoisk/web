export type FavoriteTagCandidate={tag:string;issue:'empty'|'invalid'|'duplicate'|'limit'|null};
/** UI prevalidation; the backend remains authoritative for Unicode full casefold. */
export function favoriteTagCandidate(raw:string,selected:readonly string[]):FavoriteTagCandidate{
 const tag=raw.trim().replace(/^#/,'').normalize('NFC').toLowerCase();
 if(!raw.trim())return{tag,issue:'empty'};
 if([...tag].length<1||[...tag].length>100||!/^([\p{L}\p{N}_][\p{L}\p{N}\p{M}_]*)$/u.test(tag))return{tag,issue:'invalid'};
 if(selected.some(value=>value.normalize('NFC').toLowerCase()===tag))return{tag,issue:'duplicate'};
 if(selected.length>=20)return{tag,issue:'limit'};
 return{tag,issue:null};
}
export function appendFavoriteTag(selected:string[],raw:string):string[]{const candidate=favoriteTagCandidate(raw,selected);return candidate.issue?selected:[...selected,candidate.tag];}
