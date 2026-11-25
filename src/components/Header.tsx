"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { STUDIO } from "@/lib/studio";

type Theme = "light" | "dark";

const links = [
  { href: "/work", label: "Work" },
  { href: "/studio", label: "Studio" },
  { href: "/#materials", label: "Materials" },
  { href: "/#services", label: "Services" },
];

function themeAt(x: number): Theme {
  const els = document.elementsFromPoint(x, 38);
  for (const el of els) {
    const host = (el as HTMLElement).closest?.("[data-theme]");
    if (host) return (host.getAttribute("data-theme") as Theme) ?? "light";
  }
  return "light";
}

export function Header() {
  const pathname = usePathname();
  const [left, setLeft] = useState<Theme>("light");
  const [right, setRight] = useState<Theme>("light");
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const lr = logoRef.current?.getBoundingClientRect();
      const nr = navRef.current?.getBoundingClientRect();
      if (lr) setLeft(themeAt(lr.left + lr.width / 2));
      if (nr) setRight(themeAt(nr.left + nr.width / 2));
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 240);
      lastY.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const t = window.setTimeout(update, 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const tone = (t: Theme) => (open || t === "dark" ? "text-bone" : "text-ink");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] flex items-start justify-between px-6 py-6 transition-transform duration-700 md:px-10 ${
          hidden && !open ? "-translate-y-full" : ""
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <Link
          href="/"
          ref={logoRef}
          className={`group flex items-center gap-3 transition-colors duration-500 ${tone(left)}`}
          aria-label={`${STUDIO.name} — home`}
        >
          <span className="relative block h-7 w-5 overflow-hidden rounded-t-full border border-current">
            <span className="absolute inset-x-0 bottom-0 h-0 bg-current transition-all duration-700 group-hover:h-full" style={{ transitionTimingFunction: "var(--ease)" }} />
          </span>
          <span className="display text-[1.75rem] leading-none tracking-tight">
            Halden <em className="font-light">Rowe</em>
          </span>
        </Link>

        <div ref={navRef} className={`flex items-center gap-8 transition-colors duration-500 ${tone(right)}`}>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="eyebrow ulink">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/begin" className="btn hidden !py-[0.8rem] md:inline-flex" style={{ ["--fill" as string]: "var(--color-clay)" }}>
            Begin a project
          </Link>
          <button
            className="eyebrow flex items-center gap-3 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? "Close" : "Menu"}
            <span className="relative block h-2 w-6">
              <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${open ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[110] flex flex-col justify-between bg-ink px-6 pb-10 pt-28 text-bone transition-[clip-path] duration-[900ms] md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
        style={{ transitionTimingFunction: "var(--ease-io)" }}
      >
        <nav className="flex flex-col gap-2">
          {[{ href: "/", label: "Home" }, ...links, { href: "/begin", label: "Begin a project" }].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="display text-[3.2rem] italic leading-[1.05] transition-all duration-700"
              style={{
                transitionDelay: open ? `${0.25 + i * 0.07}s` : "0s",
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(30px)",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="eyebrow space-y-2 text-bone/60">
          <p>{STUDIO.address.join(" · ")}</p>
          <p>{STUDIO.email}</p>
        </div>
      </div>
    </>
  );
}
