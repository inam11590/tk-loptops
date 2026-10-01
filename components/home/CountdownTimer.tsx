"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const INITIAL_SECONDS = 14 * 3600 + 38 * 60 + 45; // 14h 38m 45s

function formatTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Live client countdown timer for the Deal of the Day banner.
 */
export function CountdownTimer() {
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(INITIAL_SECONDS);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : INITIAL_SECONDS));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const timeLeft: TimeLeft = {
    hours: Math.floor(remainingSeconds / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: remainingSeconds % 60,
  };

  const blocks = [
    { label: "Hours", value: formatTwoDigits(timeLeft.hours) },
    { label: "Mins", value: formatTwoDigits(timeLeft.minutes) },
    { label: "Secs", value: formatTwoDigits(timeLeft.seconds) },
  ];

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Deal expires in ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds`}
      className="inline-flex items-center gap-2 sm:gap-3"
    >
      {blocks.map((block, index) => (
        <div key={block.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-[60px] flex-col items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center backdrop-blur-md sm:min-w-[68px] sm:py-2.5">
            <span className="font-heading text-xl font-extrabold tabular-nums text-white sm:text-2xl">
              {block.value}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
              {block.label}
            </span>
          </div>
          {index < blocks.length - 1 && (
            <span
              className="font-heading text-xl font-bold text-blue-400"
              aria-hidden="true"
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
