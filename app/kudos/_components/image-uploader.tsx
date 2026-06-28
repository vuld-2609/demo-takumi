"use client";

/**
 * ImageUploader — row of image thumbnails (each with a red × remove button)
 * plus a "+ Image" add button. Max 5. Only jpg/png accepted.
 * Calls onChange with the updated File array.
 */

import { useRef, useState } from "react";
import { PlusIcon, ImageIcon, CloseIcon } from "@/app/_components/home/icons";

const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const ACCEPTED_MIME = ["image/jpeg", "image/png"];
const ACCEPTED_EXT_LABEL = "jpg, png";

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function ImageUploader({ files, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    setError(null);
    const incoming = Array.from(selected);
    const invalid = incoming.find((f) => !ACCEPTED_MIME.includes(f.type));
    if (invalid) {
      setError(`"${invalid.name}" — định dạng file không hợp lệ. Chỉ chấp nhận ${ACCEPTED_EXT_LABEL}.`);
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setError(`"${tooBig.name}" — ảnh vượt quá 5MB.`);
      return;
    }
    const combined = [...files, ...incoming];
    if (combined.length > MAX_IMAGES) {
      setError(`Tối đa ${MAX_IMAGES} ảnh.`);
      onChange(combined.slice(0, MAX_IMAGES));
      return;
    }
    onChange(combined);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Thumbnails */}
        {files.map((f, i) => {
          const url = URL.createObjectURL(f);
          return (
            <div key={i} className="relative h-16 w-16 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={f.name}
                className="h-full w-full rounded-lg object-cover"
                onLoad={() => URL.revokeObjectURL(url)}
              />
              <button
                type="button"
                aria-label={`Xóa ảnh ${f.name}`}
                onClick={() => removeFile(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <CloseIcon size={10} />
              </button>
            </div>
          );
        })}

        {/* Add button — hidden when at max */}
        {files.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FFFAE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
            style={{ borderColor: "#998C5F", color: "#3D3010", minWidth: 72 }}
          >
            <span className="flex items-center gap-1">
              <PlusIcon size={14} />
              <ImageIcon size={14} />
            </span>
            <span>Image</span>
            <span className="text-xs text-gray-400">Tối đa {MAX_IMAGES}</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        // Reset value so same file can be re-selected after removal
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
