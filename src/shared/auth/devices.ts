import type { ApiClient } from '../api/client.ts';
import type { components } from '../api/schema';
export type Device = components['schemas']['Device'];
export async function loadDevices(client: Pick<ApiClient,'request'>, after: string|null, signal?: AbortSignal): Promise<{items:Device[];next:string|null}> {
 const query:{limit:number;after?:string}={limit:50};if(after)query.after=after;
 const page=await client.request('listSessions',{query,signal});
 return {items:page.items,next:page.next_cursor??null};
}
export async function revokeDevice(client: Pick<ApiClient,'request'>, id: string): Promise<void> {
 await client.request('revokeSession',{path:{id}});
}
export async function revokeOtherDevices(client: Pick<ApiClient,'request'>): Promise<void> {
 await client.request('logoutOtherSessions',{});
}
