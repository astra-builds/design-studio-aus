"use client";

import { useEffect, useRef } from "react";

/** Words ignite one by one as the paragraph scrolls through the viewport. Wrap a word in *asterisks* for italics. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5 + r.height)));
      const n = spans.length;
      spans.forEach((s, i) => {
        const t = Math.min(1, Math.max(0, p * n * 1.12 - i));
        s.style.opacity = String(0.16 + 0.84 * t);
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const em = w.startsWith("*");
        const clean = w.replace(/\*/g, "");
        return (
          <span key={i} data-w style={{ opacity: 0.16, transition: "opacity .25s linear" }} className={em ? "italic" : ""}>
            {clean}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
