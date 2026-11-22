import React, { useEffect, useRef, useState } from 'react';
import { Check, Eye, MinusCircle, MoreHorizontal } from 'lucide-react';
import { MARK_LABELS, type VideoMark } from '../shared/library/lists.ts';

/** «…» menu next to «Посмотрю позже» (YP-102): «Неинтересно» and «Просмотрено».
 * Choosing the current mark again clears it. The parent performs the write. */
export function VideoMarkMenu({ mark, disabled = false, onChange }: { mark: VideoMark | null; disabled?: boolean; onChange: (next: VideoMark | null) => Promise<void> | void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const root = useRef<HTMLSpanElement>(null), button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    root.current?.querySelector<HTMLButtonElement>('[role=menuitemcheckbox]')?.focus();
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', escape); };
  }, [open]);
  const choose = async (value: VideoMark) => {
    setOpen(false); setBusy(true);
    // aria-disabled (not disabled) keeps keyboard focus on the button.
    button.current?.focus();
    try { await onChange(mark === value ? null : value); } finally { setBusy(false); }
  };
  // Menu keyboard model: arrows/Home/End move between items, Tab leaves and closes.
  const keys = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    const list = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role=menuitemcheckbox]') ?? [])];
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const move = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: list.length - 1 }[event.key as 'ArrowDown'];
    if (move === undefined) { if (event.key === 'Tab') setOpen(false); return; }
    event.preventDefault();
    list[(move + list.length) % list.length]?.focus();
  };
  const items: [VideoMark, React.ReactNode][] = [['not_interested', <MinusCircle size={18} aria-hidden="true"/>], ['watched', <Eye size={18} aria-hidden="true"/>]];
  return <span className="mark-menu" ref={root}>
    {mark && <span className={`mark-badge mark-pill mark-${mark}`}>{mark === 'watched' ? <Eye size={16} aria-hidden="true"/> : <MinusCircle size={16} aria-hidden="true"/>}{MARK_LABELS[mark]}</span>}
    <button ref={button} type="button" className="secondary icon-only" aria-haspopup="menu" aria-expanded={open} aria-label="Другие действия с видео" disabled={disabled} aria-disabled={busy || undefined} onClick={() => { if (!busy) setOpen(v => !v); }}><MoreHorizontal size={18} aria-hidden="true"/></button>
    {open && <span className="mark-popover" role="menu" aria-label="Отметить видео" onKeyDown={keys}>
      {items.map(([value, icon]) => <button key={value} type="button" role="menuitemcheckbox" aria-checked={mark === value} tabIndex={-1} onClick={() => void choose(value)}>
        <span>{MARK_LABELS[value]}</span>{mark === value ? <Check size={18} aria-hidden="true"/> : icon}
      </button>)}
    </span>}
  </span>;
}
