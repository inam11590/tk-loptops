"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  children: React.ReactNode;
}

/**
 * Reusable scroll-triggered reveal wrapper powered by framer-motion whileInView.
 * Allows parent sections to remain React Server Components.
 */
export function FadeIn({
  delay = 0,
  direction = "up",
  duration = 0.5,
  children,
  ...props
}: FadeInProps) {
  const offset = 22;
  const initialOffset = {
    up: { y: offset, x: 0 },
    down: { y: -offset, x: 0 },
    left: { x: offset, y: 0 },
    right: { x: -offset, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
