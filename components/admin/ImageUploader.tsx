"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (nextImages: string[]) => void;
  error?: string;
}

export function ImageUploader({
  images,
  onChange,
  error,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const addedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setUploadError(data?.error ?? `Failed to upload ${file.name}`);
        } else if (data?.url) {
          addedUrls.push(data.url);
        }
      }

      if (addedUrls.length > 0) {
        onChange([...images, ...addedUrls]);
      }
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("/") && !trimmed.startsWith("http")) {
      setUploadError("Image URL must start with '/' or 'http(s)://'");
      return;
    }
    setUploadError(null);
    if (!images.includes(trimmed)) {
      onChange([...images, trimmed]);
    }
    setManualUrl("");
  };

  const handleMakePrimary = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, moved);
    onChange(copy);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFilesUpload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragActive
            ? "border-accent bg-accent/10"
            : "border-border/80 bg-surface/50 hover:border-accent/40"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFilesUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <p className="mt-3 text-xs font-bold text-foreground sm:text-sm">
          Drag &amp; drop product images here, or{" "}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-accent underline underline-offset-4 hover:text-accent/80"
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Supports JPG, PNG, WebP up to 2 MB each. First image is the primary
          cover.
        </p>
      </div>

      {/* Add by URL or Preset Asset Path */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Or paste image path (e.g. /images/laptops/hp-business.svg)"
          aria-label="Add image by path or URL"
          className="h-9 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddManualUrl}
          className="h-9 shrink-0 gap-1.5 rounded-xl text-xs font-semibold"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          <span>Add Path</span>
        </Button>
      </div>

      {(uploadError || error) && (
        <p role="alert" className="text-xs font-semibold text-rose-500">
          {uploadError || error}
        </p>
      )}

      {/* Image Grid with Reordering & Primary Badge */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={`${url}-${idx}`}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border bg-surface p-2",
                  isPrimary
                    ? "border-accent ring-1 ring-accent"
                    : "border-border/80"
                )}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-background p-2">
                  <Image
                    src={url}
                    alt={`Product image ${idx + 1}`}
                    width={200}
                    height={150}
                    unoptimized={url.startsWith("/uploads/")}
                    className="h-full w-full object-contain"
                  />
                  {isPrimary && (
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground shadow-xs">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      Primary
                    </span>
                  )}
                </div>

                <p className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground">
                  {url}
                </p>

                <div className="mt-2 flex items-center justify-between gap-1 border-t border-border/60 pt-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      aria-label="Move image left"
                      className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      aria-label="Move image right"
                      className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(idx)}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent/10"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    aria-label="Remove image"
                    className="rounded-md p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
