"use client";

import { Check, Circle } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  id?: string;
}

const SEGMENT_COLORS: Record<number, string> = {
  0: "bg-border",
  1: "bg-rose-500",
  2: "bg-amber-500",
  3: "bg-blue-500",
  4: "bg-emerald-500",
};

const TEXT_COLORS: Record<number, string> = {
  0: "text-muted-foreground",
  1: "text-rose-600 dark:text-rose-400",
  2: "text-amber-600 dark:text-amber-400",
  3: "text-blue-600 dark:text-blue-400",
  4: "text-emerald-600 dark:text-emerald-400",
};

/**
 * Live password strength meter and requirement checklist.
 */
export function PasswordStrength({
  password,
  id = "password-strength-meter",
}: PasswordStrengthProps) {
  const analysis = evaluatePasswordStrength(password);

  const criteria = [
    {
      key: "minLength",
      label: "8+ characters",
      met: analysis.checks.minLength,
    },
    {
      key: "hasLetter",
      label: "At least 1 letter",
      met: analysis.checks.hasLetter,
    },
    {
      key: "hasNumber",
      label: "At least 1 number",
      met: analysis.checks.hasNumber,
    },
    {
      key: "bonus",
      label: "Upper & lowercase or symbol",
      met: analysis.checks.hasMixedCase || analysis.checks.hasSpecial,
    },
  ];

  return (
    <div id={id} className="mt-2 space-y-2" aria-live="polite">
      {/* 4-bar visual meter */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          Password strength
        </span>
        <span className={cn("font-semibold", TEXT_COLORS[analysis.score])}>
          {password.length === 0 ? "Enter a password" : analysis.label}
        </span>
      </div>

      <div
        className="grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-valuenow={analysis.score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={`Password strength: ${analysis.label}`}
      >
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1.5 rounded-full transition-colors duration-200",
              analysis.score >= segment
                ? SEGMENT_COLORS[analysis.score]
                : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Requirement checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5 text-[11px]">
        {criteria.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              item.met
                ? "font-medium text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {item.met ? (
              <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
