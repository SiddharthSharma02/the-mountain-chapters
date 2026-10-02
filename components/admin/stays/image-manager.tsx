"use client";

import { useEffect, useId, useRef, useState } from "react";
import { uploadStayImage } from "@/lib/actions/admin-stay-builder";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { inputClass } from "@/components/admin/form-field";

export interface ManagedImage {
  id: string;
  image_url: string;
  image_type: string;
  caption: string | null;
}

type Uploader = (fd: FormData) => Promise<{ ok: true; url: string } | { ok: false; error: string }>;

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

/** Client-side mirror of the server upload rules, so admins get instant feedback. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return `${file.name}: only image files are allowed.`;
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name}: images must be smaller than 3MB.`;
  return null;
}

export function useImageUpload(folder: string, uploader: Uploader = uploadStayImage) {
  const [busy, setBusy] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const upload = async (files: File[]): Promise<string[]> => {
    const problems = files.map(validateImageFile).filter((e): e is string => Boolean(e));
    const valid = files.filter((f) => !validateImageFile(f));
    setErrors(problems);
    if (valid.length === 0) return [];
    setBusy((n) => n + valid.length);
    const results = await Promise.all(
      valid.map(async (file) => {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", folder);
        try {
          return await uploader(fd);
        } catch {
          return { ok: false as const, error: `${file.name}: upload failed.` };
        } finally {
          setBusy((n) => n - 1);
        }
      })
    );
    const failed = results.flatMap((r) => (r.ok ? [] : [r.error]));
    if (failed.length > 0) setErrors((e) => [...e, ...failed]);
    return results.flatMap((r) => (r.ok ? [r.url] : []));
  };

  return { upload, busy: busy > 0, errors };
}

/**
 * Multi-image gallery editor: upload (picker or drag-and-drop), paste a URL, reorder,
 * categorise, caption and remove. The first image is the primary one.
 */
export function ImageManager({
  images,
  onChange,
  folder,
  types,
  uploader,
  primaryLabel = "Primary",
  withCaptions = false,
}: {
  images: ManagedImage[];
  onChange: (next: ManagedImage[]) => void;
  folder: string;
  types: readonly string[];
  uploader?: Uploader;
  primaryLabel?: string;
  withCaptions?: boolean;
}) {
  const inputId = useId();
  // Uploads resolve asynchronously; append to the latest list, not the one at click time.
  const latest = useRef(images);
  useEffect(() => {
    latest.current = images;
  }, [images]);
  const { upload, busy, errors } = useImageUpload(folder, uploader);
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState("");

  const add = async (files: File[]) => {
    const urls = await upload(files);
    if (urls.length === 0) return;
    onChange([
      ...latest.current,
      ...urls.map((u) => ({ id: crypto.randomUUID(), image_url: u, image_type: types[0], caption: null })),
    ]);
  };

  const update = (id: string, patch: Partial<ManagedImage>) =>
    onChange(images.map((img) => (img.id === id ? { ...img, ...patch } : img)));

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          if (e.dataTransfer?.types?.includes("Files")) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!e.dataTransfer?.files?.length) return;
          e.preventDefault();
          setDragging(false);
          void add(Array.from(e.dataTransfer.files));
        }}
        className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-gold bg-gold/5" : "border-navy/15 bg-white"
        }`}
      >
        <label htmlFor={inputId} className="cursor-pointer rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light">
          {busy ? "Uploading…" : "Upload images"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void add(files);
          }}
        />
        <p className="text-xs text-navy/50">or drag photos here · JPG, PNG, WebP or AVIF · max 3MB each</p>
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an https:// image URL"
          aria-label="Image URL"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => {
            const u = url.trim();
            if (!/^https:\/\//.test(u)) return;
            onChange([...images, { id: crypto.randomUUID(), image_url: u, image_type: types[0], caption: null }]);
            setUrl("");
          }}
          className="shrink-0 rounded-lg px-4 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
        >
          Add URL
        </button>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <SortableList
          items={images}
          onReorder={onChange}
          getKey={(i) => i.id}
          label={(_, i) => `image ${i + 1}`}
        >
          {(img, i) => (
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads */}
              <img src={img.image_url} alt="" className="h-20 w-24 shrink-0 rounded-xl object-cover sm:h-24 sm:w-32" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  {i === 0 ? (
                    <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-gold-dark">{primaryLabel}</span>
                  ) : (
                    <span className="text-xs text-navy/40">#{i + 1}</span>
                  )}
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => onChange(images.filter((x) => x.id !== img.id))}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <select
                  aria-label="Image type"
                  value={img.image_type}
                  onChange={(e) => update(img.id, { image_type: e.target.value })}
                  className={`${inputClass} py-1.5`}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                {withCaptions && (
                  <input
                    aria-label="Caption"
                    value={img.caption ?? ""}
                    onChange={(e) => update(img.id, { caption: e.target.value || null })}
                    placeholder="Caption (optional)"
                    className={`${inputClass} py-1.5`}
                  />
                )}
              </div>
            </div>
          )}
        </SortableList>
      )}
    </div>
  );
}
