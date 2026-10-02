"use client";

import { useRef, useState } from "react";
import { moveItem } from "@/lib/stays/reorder";

/**
 * Reorderable list: drag and drop with a mouse, or the ↑/↓ buttons on touch devices
 * and for keyboard/screen-reader users (HTML5 drag events don't fire on touch).
 */
export function SortableList<T>({
  items,
  onReorder,
  getKey,
  label,
  children,
  className = "flex flex-col gap-3",
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  getKey: (item: T) => string;
  label: (item: T, index: number) => string;
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const dragFrom = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li
          key={getKey(item)}
          draggable
          onDragStart={(e) => {
            dragFrom.current = i;
            e.dataTransfer?.setData("text/plain", String(i));
            if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (over !== i) setOver(i);
          }}
          onDragLeave={() => setOver((o) => (o === i ? null : o))}
          onDrop={(e) => {
            e.preventDefault();
            if (dragFrom.current !== null) onReorder(moveItem(items, dragFrom.current, i));
            dragFrom.current = null;
            setOver(null);
          }}
          onDragEnd={() => {
            dragFrom.current = null;
            setOver(null);
          }}
          className={`flex items-stretch gap-2 rounded-2xl bg-white ring-1 transition-shadow ${
            over === i ? "ring-2 ring-gold" : "ring-navy/10"
          }`}
        >
          <div className="flex w-10 shrink-0 cursor-grab flex-col items-center justify-center gap-1 rounded-l-2xl bg-cream-dark/40 text-navy/50 active:cursor-grabbing">
            <button
              type="button"
              aria-label={`Move ${label(item, i)} up`}
              disabled={i === 0}
              onClick={() => onReorder(moveItem(items, i, i - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-navy/5 disabled:opacity-25"
            >
              ↑
            </button>
            <span aria-hidden className="select-none text-xs leading-none tracking-tighter">⋮⋮</span>
            <button
              type="button"
              aria-label={`Move ${label(item, i)} down`}
              disabled={i === items.length - 1}
              onClick={() => onReorder(moveItem(items, i, i + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-navy/5 disabled:opacity-25"
            >
              ↓
            </button>
          </div>
          <div className="min-w-0 flex-1 py-3 pr-3">{children(item, i)}</div>
        </li>
      ))}
    </ul>
  );
}
