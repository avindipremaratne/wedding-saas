"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";
import { uploadPhotos } from "./upload";
import { dangerButtonClass, secondaryButtonClass } from "./ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

function useUploader(siteId: string) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const upload = async (files: File[]) => {
    if (files.length === 0) return [];
    setBusy(true);
    setErrors([]);
    try {
      const result = await uploadPhotos(siteId, files);
      setErrors(result.errors);
      return result.paths;
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Upload failed."]);
      return [];
    } finally {
      setBusy(false);
    }
  };
  return { busy, errors, upload };
}

function Thumb({ path, alt, size = 96 }: { path: string; alt: string; size?: number }) {
  return (
    <Image
      src={mediaUrl(path)}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className="rounded-md border border-stone-200 bg-stone-100 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function Errors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-red-600" role="alert">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

/** One photo (hero or logo). The chosen path rides along in a hidden input. */
export function SinglePhoto({ siteId, name, label, value, onChange }: { siteId: string; name: string; label: string; value: string; onChange: (path: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, errors, upload } = useUploader(siteId);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-stone-800">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-4">
        {value ? <Thumb path={value} alt={label} /> : <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-stone-300 text-xs text-stone-400">None</div>}
        <div className="flex flex-col items-start gap-2">
          <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" className={dangerButtonClass} onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={async (e) => {
            const [path] = await upload(Array.from(e.target.files ?? []).slice(0, 1));
            if (path) onChange(path);
            e.target.value = "";
          }}
        />
      </div>
      <Errors errors={errors} />
    </div>
  );
}

/** The gallery: upload several at once, reorder, remove. */
export function GalleryPhotos({ siteId, value, onChange }: { siteId: string; value: string[]; onChange: (paths: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, errors, upload } = useUploader(siteId);
  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-stone-800">Gallery photos</p>
      <input type="hidden" name="gallery" value={JSON.stringify(value)} />
      {value.length > 0 && (
        <ol className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((path, i) => (
            <li key={path} className="rounded-lg border border-stone-200 p-2">
              <Thumb path={path} alt={`Gallery photo ${i + 1}`} size={140} />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-stone-500">{i + 1}</span>
                <span className="flex gap-1">
                  <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded px-1.5 hover:bg-stone-100 disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} className="rounded px-1.5 hover:bg-stone-100 disabled:opacity-30">
                    →
                  </button>
                  <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded px-1.5 text-red-700 hover:bg-red-50">
                    ✕
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : "Add photos"}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={async (e) => {
          const paths = await upload(Array.from(e.target.files ?? []));
          if (paths.length > 0) onChange([...value, ...paths]);
          e.target.value = "";
        }}
      />
      <Errors errors={errors} />
    </div>
  );
}
