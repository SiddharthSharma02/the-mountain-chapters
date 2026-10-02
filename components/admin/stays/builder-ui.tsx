"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useImageUpload } from "@/components/admin/stays/image-manager";
import { inputClass } from "@/components/admin/form-field";
import type { ActionResult } from "@/lib/actions/admin-stay-builder";

export { inputClass };

export function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/5 sm:p-7">
      <h2 className="font-serif text-xl font-bold text-navy">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-navy/60">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function TextField({
  label, value, onChange, hint, multiline = false, rows = 4, ...rest
}: {
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>
      <div className="mt-1">
        {multiline ? (
          <textarea id={id} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={rest.placeholder} />
        ) : (
          <input id={id} {...rest} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-navy">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 accent-navy" />
      <span>
        {label}
        {hint && <span className="block text-xs text-navy/50">{hint}</span>}
      </span>
    </label>
  );
}

type SaveState = { status: "idle" | "saving" | "saved" | "error"; error?: string };

/** Runs a server action, refreshes server data on success and tracks status for the SaveBar. */
export function useSave() {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const run = async <T extends object>(fn: () => Promise<ActionResult<T>>) => {
    setState({ status: "saving" });
    try {
      const result = await fn();
      if (!result.ok) {
        setState({ status: "error", error: result.error });
        return null;
      }
      setState({ status: "saved" });
      router.refresh();
      return result;
    } catch {
      setState({ status: "error", error: "Could not reach the server. Please try again." });
      return null;
    }
  };
  return { state, run };
}

export function SaveBar({ state, onSave, label = "Save changes" }: { state: SaveState; onSave: () => void; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-4 border-t border-navy/10 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
      <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-600" : "text-navy/60"}`}>
        {state.status === "saving" && "Saving…"}
        {state.status === "saved" && "Saved ✓"}
        {state.status === "error" && state.error}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={state.status === "saving"}
        className="min-h-11 shrink-0 rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light disabled:opacity-60"
      >
        {label}
      </button>
    </div>
  );
}

/** One image: upload, paste a URL, preview or remove. */
export function SingleImageField({
  label, value, onChange, folder, hint,
}: { label: string; value: string | null; onChange: (url: string | null) => void; folder: string; hint?: string }) {
  const id = useId();
  const { upload, busy, errors } = useImageUpload(folder);
  return (
    <div>
      <p className="text-sm font-medium text-navy">{label}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
          <img src={value} alt="" className="h-28 w-full rounded-xl object-cover sm:w-44" />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-xl bg-cream-dark/60 text-xs text-navy/40 sm:w-44">No image</div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <label htmlFor={id} className="cursor-pointer rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream hover:bg-navy-light">
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </label>
            <input
              id={id}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={`Upload ${label}`}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const [url] = await upload([f]);
                if (url) onChange(url);
              }}
            />
            {value && (
              <button type="button" onClick={() => onChange(null)} className="rounded-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
                Remove
              </button>
            )}
          </div>
          <input
            aria-label={`${label} URL`}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="https://…"
            className={`${inputClass} py-2`}
          />
          {hint && <p className="text-xs text-navy/50">{hint}</p>}
          {errors.length > 0 && <p role="alert" className="text-xs text-red-600">{errors.join(" ")}</p>}
        </div>
      </div>
    </div>
  );
}

export const newId = () => crypto.randomUUID();
