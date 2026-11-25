"use client";

import { useEffect, useRef } from "react";

/**
 * Image frame with scroll-linked parallax. The image is oversized inside an
 * overflow-hidden frame so it can drift without revealing edges.
 */
export function ParallaxImg({
  src,
  alt = "",
  speed = 0.12,
  position = "50% 50%",
  className = "",
  imgClassName = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  speed?: number;
  position?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const f = frame.current;
    const i = img.current;
    if (!f || !i) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = f.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2 - vh / 2;
      i.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0) scale(1.18)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover will-change-transform ${imgClassName}`}
        style={{ objectPosition: position, transform: "scale(1.18)" }}
      />
    </div>
  );
}
