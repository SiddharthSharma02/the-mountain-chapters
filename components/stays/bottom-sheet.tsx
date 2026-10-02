"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/stays/icons";

/**
 * Mobile bottom sheet (centred dialog from md up). Closes on Escape, backdrop tap,
 * the close button, or a downward swipe on the handle. Locks page scroll while open
 * and returns focus to whatever opened it.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const endDrag = () => {
    if (dragY > 90) onClose();
    dragStart.current = null;
    setDragY(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-6">
      {/* Pointer-only affordance; keyboard/AT users close via Escape or the close button. */}
      <div
        aria-hidden
        data-testid="sheet-backdrop"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-navy/50 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        className="animate-sheet-in relative flex max-h-[90svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-cream text-navy shadow-2xl outline-none md:max-h-[85vh] md:max-w-lg md:rounded-[28px]"
      >
        <div
          className="shrink-0 touch-none px-5 pb-3 pt-2.5"
          onTouchStart={(e) => (dragStart.current = e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (dragStart.current !== null) setDragY(Math.max(0, e.touches[0].clientY - dragStart.current));
          }}
          onTouchEnd={endDrag}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-navy/15 md:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-serif text-xl font-semibold leading-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy/70 hover:bg-navy/5"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-navy/10 bg-cream px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
