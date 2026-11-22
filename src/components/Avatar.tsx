import React, { useEffect, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';

type AvatarReader = Partial<Pick<ApiClient, 'avatar'>>;
const listeners = new Set<(id?: string) => void>();
export function invalidateAvatar(userId?: string): void {
  for (const listener of listeners) listener(userId);
}
/** No shared cache: signed image URLs belong to the component's account scope. */
export function Avatar({ client, userId, name, className = 'avatar' }: { client: AvatarReader | null; userId: string; name: string; className?: string }) {
  const [image, setImage] = useState<{ client: AvatarReader; userId: string; version: number; url: string } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = (id?: string) => { if (!id || id === userId) setVersion(v => v + 1); };
    listeners.add(bump);
    return () => { listeners.delete(bump); };
  }, [userId]);
  useEffect(() => {
    const controller = new AbortController();
    if (client?.avatar) void client.avatar(userId, controller.signal).then(url => {
      if (!controller.signal.aborted) setImage(url ? { client, userId, version, url } : null);
    }).catch(() => { if (!controller.signal.aborted) setImage(null); });
    return () => controller.abort();
  }, [client, userId, version]);
  const url = image?.client === client && image.userId === userId && image.version === version ? image.url : null;
  return <span className={className + (url ? ' has-image' : '')} aria-hidden="true">{url ? <img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setImage(null)}/> : [...(name || '?')][0]}</span>;
}
