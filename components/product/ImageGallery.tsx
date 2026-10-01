"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const ANGLE_LABELS = [
  "Front Studio View",
  "Keyboard & Deck View",
  "Side Profile & I/O Ports",
  "Display Close-up View",
];

/**
 * Interactive Product Image Gallery with:
 * - Main image with priority loading & zero layout shift
 * - Desktop hover lens zoom & mobile tap-to-zoom toggle
 * - Thumbnail strip switcher
 * - Fullscreen Lightbox modal (focus-trapped via Radix Dialog) with Next/Prev buttons,
 *   keyboard navigation (ArrowLeft, ArrowRight, Escape), and mobile touch swipe support.
 */
export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const galleryImages =
    images.length > 0 ? images : ["/images/laptops/hp-business.svg"];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [isMobileZoomed, setIsMobileZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
    setIsMobileZoomed(false);
  }, [galleryImages.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
    setIsMobileZoomed(false);
  }, [galleryImages.length]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrev]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
    touchStartX.current = null;
  };

  const currentImage = galleryImages[selectedIndex] ?? galleryImages[0];
  const currentAngleLabel =
    ANGLE_LABELS[selectedIndex] ?? `View ${selectedIndex + 1}`;
  const isZoomActive = isHoverZoomed || isMobileZoomed;

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div
        onMouseEnter={() => setIsHoverZoomed(true)}
        onMouseLeave={() => setIsHoverZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-surface p-6 shadow-card select-none"
      >
        {/* Top Controls: Angle Badge, Mobile Zoom Toggle & Fullscreen Lightbox Trigger */}
        <div className="relative z-20 flex items-center justify-between gap-2">
          <span className="rounded-lg border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
            {currentAngleLabel} ({selectedIndex + 1}/{galleryImages.length})
          </span>

          <div className="flex items-center gap-2">
            {/* Mobile Tap Zoom Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsMobileZoomed((prev) => !prev)}
              aria-label={
                isMobileZoomed ? "Reset image zoom" : "Zoom in on image"
              }
              aria-pressed={isMobileZoomed}
              className="h-9 w-9 rounded-xl bg-background/85 backdrop-blur-sm lg:hidden"
            >
              {isMobileZoomed ? (
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {/* Fullscreen Lightbox Trigger */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open fullscreen image lightbox"
              title="Open fullscreen lightbox"
              className="h-9 w-9 rounded-xl bg-background/85 backdrop-blur-sm"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Clickable Main Image with Hover / Tap Zoom */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${productName} ${currentAngleLabel} in fullscreen`}
          className="relative flex h-[calc(100%-2.25rem)] w-full cursor-zoom-in items-center justify-center focus-visible:outline-none"
        >
          <Image
            src={currentImage}
            alt={`${productName} — ${currentAngleLabel}`}
            width={800}
            height={600}
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
            className={cn(
              "h-full w-full object-contain transition-transform duration-200 ease-out",
              isZoomActive && "scale-150"
            )}
          />
        </button>

        {/* Left / Right Quick Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div
        role="tablist"
        aria-label="Product image thumbnails"
        className="grid grid-cols-4 gap-3"
      >
        {galleryImages.map((imgSrc, index) => {
          const isSelected = index === selectedIndex;
          const label = ANGLE_LABELS[index] ?? `View ${index + 1}`;
          return (
            <button
              key={`${imgSrc}-${index}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Select ${label}`}
              onClick={() => {
                setSelectedIndex(index);
                setIsMobileZoomed(false);
              }}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-xl border bg-surface p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border/70 opacity-75 hover:border-accent/40 hover:opacity-100"
              )}
            >
              <Image
                src={imgSrc}
                alt={`${productName} thumbnail ${index + 1}`}
                width={180}
                height={135}
                sizes="150px"
                className="h-full w-full object-contain"
              />
            </button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal (Focus Trapped via Radix Dialog) */}
      <DialogPrimitive.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-label={`${productName} fullscreen image gallery`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 flex flex-col justify-between p-4 focus:outline-none sm:p-8"
          >
            <DialogPrimitive.Title className="sr-only">
              {productName} — {currentAngleLabel}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Use Left and Right arrow keys to cycle through product images or
              press Escape to close.
            </DialogPrimitive.Description>

            {/* Lightbox Header */}
            <div className="flex items-center justify-between text-white">
              <div className="space-y-0.5">
                <p className="font-heading text-sm font-bold sm:text-base">
                  {productName}
                </p>
                <p className="text-xs text-slate-300">
                  {currentAngleLabel} • Image {selectedIndex + 1} of{" "}
                  {galleryImages.length}
                </p>
              </div>

              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Close fullscreen gallery"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            {/* Lightbox Center Image + Prev/Next Controls */}
            <div className="relative my-auto flex max-h-[72vh] w-full items-center justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToPrev}
                aria-label="Previous image in lightbox"
                className="absolute left-0 z-20 h-11 w-11 rounded-full border-white/20 bg-white/10 text-white hover:bg-accent hover:text-white sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </Button>

              <div className="relative aspect-[4/3] h-full max-h-[68vh] w-full max-w-4xl p-4">
                <Image
                  src={currentImage}
                  alt={`${productName} — ${currentAngleLabel}`}
                  width={960}
                  height={720}
                  sizes="90vw"
                  className="h-full w-full object-contain"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToNext}
                aria-label="Next image in lightbox"
                className="absolute right-0 z-20 h-11 w-11 rounded-full border-white/20 bg-white/10 text-white hover:bg-accent hover:text-white sm:right-4"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>

            {/* Lightbox Bottom Thumbnails */}
            <div className="mx-auto flex max-w-md items-center justify-center gap-2.5">
              {galleryImages.map((imgSrc, idx) => (
                <button
                  key={`lb-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    "h-14 w-20 overflow-hidden rounded-lg border bg-slate-900/80 p-1.5 transition-all",
                    idx === selectedIndex
                      ? "border-accent ring-2 ring-accent"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={imgSrc}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    width={80}
                    height={60}
                    sizes="80px"
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
