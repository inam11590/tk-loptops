"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { getPublishedProducts } from "@/lib/productStore";
import { formatPrice } from "@/lib/config";
import { getSearchSuggestions } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  className?: string;
  onNavigate?: () => void;
}

/**
 * Live debounced search bar with top-5 autocomplete suggestions dropdown,
 * keyboard navigation, and Enter -> /search?q=... routing.
 */
export function SearchBar({ className, onNavigate }: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Debounce input by 200ms
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const suggestions = getSearchSuggestions(
    debouncedQuery,
    getPublishedProducts(),
    5
  );
  const showDropdown = isOpen && debouncedQuery.trim().length > 0;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    setIsOpen(false);
    onNavigate?.();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/laptops");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      navigateToSearch(suggestions[activeIndex].name);
      return;
    }
    navigateToSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        role="search"
        aria-label="Search laptops"
        onSubmit={handleSubmit}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search HP, Dell, i7, RTX..."
          aria-label="Search HP or Dell laptops"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          className="h-10 rounded-xl pl-10 pr-9 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setActiveIndex(-1);
            }}
            aria-label="Clear search query"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      {/* Live Debounced Suggestions Dropdown (Top 5 Matches) */}
      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute right-0 top-full z-50 mt-2 w-full min-w-[300px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl sm:w-[360px]"
        >
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No instant matches for{" "}
              <strong className="text-foreground">
                &ldquo;{debouncedQuery}&rdquo;
              </strong>
              . Press Enter to search all laptops.
            </div>
          ) : (
            <>
              <div className="border-b border-border/60 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Top Matches ({suggestions.length})
              </div>
              <ul className="divide-y divide-border/50">
                {suggestions.map((product, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <li
                      key={product.id}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <Link
                        href={`/laptops/${product.slug}`}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate?.();
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-surface",
                          isSelected && "bg-surface"
                        )}
                      >
                        <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-surface p-1">
                          <Image
                            src={
                              product.images[0] ??
                              "/images/laptops/hp-business.svg"
                            }
                            alt={product.name}
                            width={56}
                            height={44}
                            sizes="56px"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                product.brand === "HP" ? "hp" : "dell"
                              }
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {product.brand}
                            </Badge>
                            <p className="truncate text-xs font-semibold text-foreground">
                              {product.name}
                            </p>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {product.specs.processor} • {product.specs.ram}
                          </p>
                        </div>
                        <span className="shrink-0 font-heading text-xs font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-border/60 bg-surface/60 p-2">
                <button
                  type="button"
                  onClick={() => navigateToSearch(debouncedQuery)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
                >
                  <span>
                    View all results for &ldquo;{debouncedQuery}&rdquo;
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
