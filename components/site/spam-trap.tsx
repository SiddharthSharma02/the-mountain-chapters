"use client";

import { useEffect, useRef } from "react";
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/spam";

/** Hidden inputs for the bot filter in lib/spam.ts. Place inside any public <form>. */
export function SpamTrap() {
  const startedAt = useRef<HTMLInputElement>(null);
  // Stamp the time after mount so server and client HTML match.
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  return (
    <>
      <input ref={startedAt} type="hidden" name={STARTED_AT_FIELD} defaultValue="" />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}
