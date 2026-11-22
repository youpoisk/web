import React, { useEffect, useRef, useState } from 'react';
import { Check, Eye, MinusCircle, MoreHorizontal } from 'lucide-react';
import { MARK_LABELS, type VideoMark } from '../shared/library/lists.ts';

/** «…» menu next to «Посмотрю позже» (YP-102): «Неинтересно» and «Просмотрено».
 * Choosing the current mark again clears it. The parent performs the write. */
export function VideoMarkMenu({ mark, disabled = false, onChange }: { mark: VideoMark | null; disabled?: boolean; onChange: (next: VideoMark | null) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null), button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', escape);
    root.current?.querySelector<HTMLButtonElement>('[role=menuitemcheckbox]')?.focus();
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', escape); };
  }, [open]);
  const choose = (value: VideoMark) => { setOpen(false); button.current?.focus(); onChange(mark === value ? null : value); };
  const items: [VideoMark, React.ReactNode][] = [['not_interested', <MinusCircle size={18} aria-hidden="true"/>], ['watched', <Eye size={18} aria-hidden="true"/>]];
  return <span className="mark-menu" ref={root}>
    {mark && <span className={`mark-badge mark-pill mark-${mark}`}>{mark === 'watched' ? <Eye size={16} aria-hidden="true"/> : <MinusCircle size={16} aria-hidden="true"/>}{MARK_LABELS[mark]}</span>}
    <button ref={button} type="button" className="secondary icon-only" aria-haspopup="menu" aria-expanded={open} aria-label="Другие действия с видео" disabled={disabled} onClick={() => setOpen(v => !v)}><MoreHorizontal size={18} aria-hidden="true"/></button>
    {open && <span className="mark-popover" role="menu" aria-label="Отметить видео">
      {items.map(([value, icon]) => <button key={value} type="button" role="menuitemcheckbox" aria-checked={mark === value} onClick={() => choose(value)}>
        <span>{MARK_LABELS[value]}</span>{mark === value ? <Check size={18} aria-hidden="true"/> : icon}
      </button>)}
    </span>}
  </span>;
}
