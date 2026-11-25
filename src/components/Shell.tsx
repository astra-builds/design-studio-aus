"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Wraps the site in a cinematic page transition: a clay-umber curtain rises,
 * the route changes behind it, then it lifts away.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "cover" | "leave">("idle");
  const pending = useRef(false);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page: hash/search handled natively
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      clear();
      setState("cover");
      timers.current.push(
        window.setTimeout(() => router.push(url.pathname + url.search + url.hash), 800),
        // fail-safe: never leave the curtain stuck
        window.setTimeout(() => {
          setState("leave");
          pending.current = false;
        }, 3500),
      );
    };
    // capture phase so we run before next/link's own handler and can take over navigation
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!pending.current) return;
    clear();
    window.scrollTo(0, 0);
    const t1 = window.setTimeout(() => setState("leave"), 150);
    const t2 = window.setTimeout(() => {
      setState("idle");
      pending.current = false;
    }, 1250);
    timers.current.push(t1, t2);
  }, [pathname]);

  useEffect(() => () => clear(), []);

  return (
    <>
      {children}
      <div className="curtain" data-state={state} aria-hidden>
        <span className="display text-5xl md:text-7xl italic">Halden Rowe</span>
      </div>
    </>
  );
}
