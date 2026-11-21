import React from 'react';
export function PeopleListSearch({value,onChange}:{value:string;onChange:(value:string)=>void}) {
 return <section className="panel"><h2>Найти людей</h2><input aria-label="Поиск по текущему списку" placeholder="Имя или логин, например @anna" value={value} onChange={e=>onChange(e.target.value)}/></section>;
}
