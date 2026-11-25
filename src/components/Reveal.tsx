"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function useInView<T extends HTMLElement>(threshold = 0.15, rootMargin = "0px 0px -6% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);
  return [ref, inView] as const;
}

type Variant = "fade" | "image" | "arch";

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(variant === "fade" ? 0.1 : 0.08);
  const base = variant === "image" ? "img-reveal" : variant === "arch" ? "arch-reveal" : "reveal";
  return (
    <div
      ref={ref}
      className={`${base} ${inView ? "in" : ""} ${className}`}
      style={{ ["--d" as string]: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

/** Splits a headline into masked lines that rise into view. Pass lines as array. */
export function Lines({
  lines,
  className = "",
  delay = 0,
  step = 0.12,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  step?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={`${inView ? "in" : ""} ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="line" style={{ ["--d" as string]: `${delay + i * step}s` }}>
          <span>{l}</span>
        </span>
      ))}
    </div>
  );
}
