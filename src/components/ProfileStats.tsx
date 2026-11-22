import React from'react';
type Counts={library_videos:number|null;ratings_count:number|null;friends_count:number|null;following_count:number|null};
export function ProfileStats({counts}:{counts:Counts|null}){
 const fields:[keyof Counts,string][]=[['library_videos','Видео в подборке'],['ratings_count','Оценки'],['friends_count','Друзья'],['following_count','Подписки']];
 return <div className="stats profile-stats" aria-label="Статистика профиля">{fields.map(([field,label])=><div key={field}><b className={counts?.[field]===null?'stat-hidden':''}>{!counts?<span aria-label="Значение загружается или недоступно">—</span>:counts[field]===null?'Скрыто':counts[field]!.toLocaleString('ru-RU')}</b><span>{label}</span></div>)}</div>;
}
