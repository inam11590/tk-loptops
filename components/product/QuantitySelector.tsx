"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (nextQuantity: number) => void;
  disabled?: boolean;
}

/**
 * Accessible quantity stepper constrained between 1 and available stock.
 */
export function QuantitySelector({
  quantity,
  maxStock,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const effectiveMax = Math.max(1, maxStock);
  const canDecrement = !disabled && quantity > 1;
  const canIncrement = !disabled && quantity < effectiveMax;

  return (
    <div className="inline-flex items-center rounded-xl border border-input bg-surface p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canDecrement}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="Decrease quantity"
        className="h-9 w-9 rounded-lg"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>

      <input
        type="number"
        min={1}
        max={effectiveMax}
        disabled={disabled}
        value={quantity}
        aria-label="Product quantity"
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (Number.isNaN(val)) return;
          onChange(Math.max(1, Math.min(effectiveMax, val)));
        }}
        className="h-9 w-12 bg-transparent text-center font-heading text-sm font-bold text-foreground focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canIncrement}
        onClick={() => onChange(Math.min(effectiveMax, quantity + 1))}
        aria-label="Increase quantity"
        className="h-9 w-9 rounded-lg"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
