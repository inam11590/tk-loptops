"use client";

import { useEffect, useState } from "react";

/**
 * Returns `false` during SSR and initial client hydration, and `true` once mounted on the client.
 * Prevents hydration mismatch errors when rendering values persisted in `localStorage`.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
