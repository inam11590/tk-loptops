"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createProductAction,
  deleteProductAction,
  duplicateProductAction,
  updateProductAction,
} from "@/lib/actions/admin-actions";
import {
  adminProductSchema,
  type AdminProductFormValues,
} from "@/lib/validations/admin";
import type { LaptopCategory, Product } from "@/types/product";

const CATEGORIES: { value: LaptopCategory; label: string }[] = [
  { value: "business", label: "Business Laptops" },
  { value: "gaming", label: "Gaming Laptops" },
  { value: "student", label: "Student Laptops" },
  { value: "ultrabook", label: "Ultrabooks" },
  { value: "budget", label: "Budget Laptops" },
];

function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialProduct?: Product;
}

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [highlightInput, setHighlightInput] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const initialTags = initialProduct?.tags ?? [];

  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(
      adminProductSchema
    ) as unknown as Resolver<AdminProductFormValues>,
    defaultValues: {
      name: initialProduct?.name ?? "",
      slug: initialProduct?.slug ?? "",
      sku: initialProduct?.sku ?? `TKL-${Date.now().toString().slice(-5)}`,
      brand: initialProduct?.brand ?? "HP",
      category: initialProduct?.category ?? "business",
      shortDescription: initialProduct?.shortDescription ?? "",
      description: initialProduct?.description ?? "",
      price: initialProduct?.price ?? 999,
      oldPrice: initialProduct?.oldPrice ?? "",
      stock: initialProduct?.stock ?? 10,
      lowStockThreshold: initialProduct?.lowStockThreshold ?? 5,
      status: initialProduct?.status ?? "published",
      tags: initialTags,
      highlights: initialProduct?.highlights ?? [
        "Official Brand Warranty Included",
        "Fast PCIe Gen4 NVMe Storage",
        "Full HD+ Anti-Glare IPS Display",
      ],
      images:
        initialProduct?.images && initialProduct.images.length > 0
          ? initialProduct.images
          : ["/images/laptops/hp-business.svg"],
      specs: {
        processor: initialProduct?.specs.processor ?? "Intel Core Ultra 7 155U",
        ram: initialProduct?.specs.ram ?? "16GB LPDDR5X",
        storage: initialProduct?.specs.storage ?? "512GB PCIe Gen4 NVMe SSD",
        display: initialProduct?.specs.display ?? '14" WUXGA (1920x1200) IPS',
        gpu: initialProduct?.specs.gpu ?? "Intel Integrated Graphics",
        os: initialProduct?.specs.os ?? "Windows 11 Pro",
        battery: initialProduct?.specs.battery ?? "56Wh Li-ion, up to 12 hours",
        weight: initialProduct?.specs.weight ?? "1.38 kg",
        ports:
          initialProduct?.specs.ports ??
          "2x Thunderbolt 4, 2x USB-A 3.2, 1x HDMI 2.1, Audio Jack",
        warranty:
          initialProduct?.specs.warranty ?? "1-Year Official Brand Warranty",
      },
      seoTitle: initialProduct?.seoTitle ?? initialProduct?.name ?? "",
      seoDescription:
        initialProduct?.seoDescription ??
        initialProduct?.shortDescription ??
        "",
    },
  });

  const isDirty = form.formState.isDirty;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!slugTouched && watchedName) {
      form.setValue("slug", slugifyText(watchedName), {
        shouldValidate: true,
      });
    }
  }, [watchedName, slugTouched, form]);

  const images = form.watch("images") ?? [];
  const highlights = form.watch("highlights") ?? [];
  const tags = form.watch("tags") ?? [];

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    form.setValue("tags", next, { shouldDirty: true });
  };

  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim();
    if (!trimmed) return;
    form.setValue("highlights", [...highlights, trimmed], {
      shouldDirty: true,
    });
    setHighlightInput("");
  };

  const handleRemoveHighlight = (idx: number) => {
    form.setValue(
      "highlights",
      highlights.filter((_, i) => i !== idx),
      { shouldDirty: true }
    );
  };

  const onSubmit = async (values: AdminProductFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const res = await createProductAction(values);
        if (!res.success || !res.product) {
          setServerError(res.error ?? "Failed to create product.");
          return;
        }
        form.reset(values);
        router.push(`/admin/products/${res.product.id}`);
        router.refresh();
      } else if (initialProduct) {
        const res = await updateProductAction(initialProduct.id, values);
        if (!res.success || !res.product) {
          setServerError(res.error ?? "Failed to update product.");
          return;
        }
        form.reset(values);
        setSuccessMessage("Product saved and storefront updated.");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!initialProduct) return;
    setDuplicating(true);
    setServerError(null);
    try {
      const res = await duplicateProductAction(initialProduct.id);
      if (!res.success || !res.product) {
        setServerError(res.error ?? "Unable to duplicate product.");
        return;
      }
      router.push(`/admin/products/${res.product.id}`);
      router.refresh();
    } finally {
      setDuplicating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!initialProduct) return;
    setDeleting(true);
    setServerError(null);
    try {
      const res = await deleteProductAction(initialProduct.id);
      if (!res.success) {
        setServerError(res.error ?? "Unable to delete product.");
        setDeleteDialogOpen(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Products</span>
            </Link>
            {isDirty && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            {mode === "create"
              ? "Add New Laptop Product"
              : `Edit: ${initialProduct?.name}`}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === "edit" && initialProduct && (
            <>
              {initialProduct.status === "published" && (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Link
                    href={`/laptops/${initialProduct.slug}`}
                    target="_blank"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View in Store</span>
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={duplicating}
                onClick={handleDuplicate}
                className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{duplicating ? "Duplicating..." : "Duplicate"}</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </>
          )}

          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={submitting}
            className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-sm"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>
              {mode === "create" ? "Create Product" : "Save Changes"}
            </span>
          </Button>
        </div>
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400"
        >
          {serverError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Two-Column Form Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Core Details, Images, Specs, In the Box, SEO */}
        <div className="space-y-6 lg:col-span-8">
          {/* General Information */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              General Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...form.register("name")}
                  placeholder="e.g. HP EliteBook 840 G10"
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...form.register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                  placeholder="hp-elitebook-840-g10"
                />
                {errors.slug && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  SKU <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...form.register("sku")}
                  placeholder="TKL-HP-840G10"
                />
                {errors.sku && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <Input
                {...form.register("shortDescription")}
                placeholder="Concise one-line summary shown on cards and top of PDP"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Full Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                {...form.register("description")}
                placeholder="Detailed overview of build quality, display, thermal design, and ideal workloads..."
                className="flex w-full rounded-xl border border-input bg-surface px-3.5 py-2.5 text-sm text-foreground shadow-xs focus-visible:border-accent focus-visible:outline-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </section>

          {/* Product Images */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                Product Images
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload JPG, PNG, or WebP images (max 2 MB) or reorder existing
                gallery items.
              </p>
            </div>

            <ImageUploader
              images={images}
              onChange={(next) =>
                form.setValue("images", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={errors.images?.message as string | undefined}
            />
          </section>

          {/* Technical Specifications */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Processor (CPU) *
                </label>
                <Input {...form.register("specs.processor")} />
                {errors.specs?.processor && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.processor.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Memory (RAM) *
                </label>
                <Input {...form.register("specs.ram")} />
                {errors.specs?.ram && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.ram.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Storage (SSD) *
                </label>
                <Input {...form.register("specs.storage")} />
                {errors.specs?.storage && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.storage.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Display *
                </label>
                <Input {...form.register("specs.display")} />
                {errors.specs?.display && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.display.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Graphics (GPU) *
                </label>
                <Input {...form.register("specs.gpu")} />
                {errors.specs?.gpu && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.gpu.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Operating System *
                </label>
                <Input {...form.register("specs.os")} />
                {errors.specs?.os && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.os.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Battery *
                </label>
                <Input {...form.register("specs.battery")} />
                {errors.specs?.battery && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.battery.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Weight *
                </label>
                <Input {...form.register("specs.weight")} />
                {errors.specs?.weight && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.weight.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Ports &amp; Connectivity *
                </label>
                <Input {...form.register("specs.ports")} />
                {errors.specs?.ports && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.ports.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Warranty *
                </label>
                <Input {...form.register("specs.warranty")} />
                {errors.specs?.warranty && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.specs.warranty.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Key Highlights / Box Items */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Key Highlights &amp; Package Contents
            </h2>

            <div className="flex gap-2">
              <Input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                placeholder="e.g. 100W USB-C Power Adapter Included"
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHighlight}
                className="h-9 shrink-0 gap-1 rounded-xl text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <ul className="space-y-1.5">
              {highlights.map((item, idx) => (
                <li
                  key={`${item}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-xs font-medium"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="rounded-md p-1 text-muted-foreground hover:text-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* SEO Meta */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Search Engine Optimization (SEO)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Meta Title
                </label>
                <Input
                  {...form.register("seoTitle")}
                  placeholder="Defaults to product name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  {...form.register("seoDescription")}
                  placeholder="Defaults to short description"
                  className="flex w-full rounded-xl border border-input bg-surface px-3.5 py-2 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Status, Classification, Pricing, Inventory */}
        <div className="space-y-6 lg:col-span-4">
          {/* Publishing & Visibility */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Publishing &amp; Status
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Visibility Status
              </label>
              <select
                {...form.register("status")}
                className="h-10 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
              >
                <option value="published">Published (Live on Storefront)</option>
                <option value="draft">Draft (Hidden from Storefront)</option>
              </select>
            </div>

            <div className="space-y-2.5 border-t border-border/60 pt-3 text-xs">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-foreground">
                  Best Seller Tag
                </span>
                <input
                  type="checkbox"
                  checked={tags.includes("bestseller")}
                  onChange={() => toggleTag("bestseller")}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-foreground">
                  Deal of the Day / Hot Deal
                </span>
                <input
                  type="checkbox"
                  checked={tags.includes("deal")}
                  onChange={() => toggleTag("deal")}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-foreground">
                  New Arrival Badge
                </span>
                <input
                  type="checkbox"
                  checked={tags.includes("new")}
                  onChange={() => toggleTag("new")}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </label>
            </div>
          </section>

          {/* Brand & Category */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Classification
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Brand
              </label>
              <select
                {...form.register("brand")}
                className="h-10 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
              >
                <option value="HP">HP</option>
                <option value="Dell">Dell</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Category
              </label>
              <select
                {...form.register("category")}
                className="h-10 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Pricing (USD)
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Selling Price ($) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="1"
                min="1"
                {...form.register("price")}
              />
              {errors.price && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Compare-at Old Price ($)
              </label>
              <Input
                type="number"
                step="1"
                placeholder="Optional (must be > selling price)"
                {...form.register("oldPrice")}
              />
              {errors.oldPrice && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {errors.oldPrice.message}
                </p>
              )}
            </div>
          </section>

          {/* Inventory & Stock */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Inventory &amp; Stock
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Available Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                {...form.register("stock")}
              />
              {errors.stock && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Low Stock Alert Threshold
              </label>
              <Input
                type="number"
                step="1"
                min="1"
                {...form.register("lowStockThreshold")}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product Permanently?"
        description={`Are you sure you want to delete "${initialProduct?.name}"? This action will remove it from the catalog and cannot be undone.`}
        confirmLabel="Delete Product"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </form>
  );
}
