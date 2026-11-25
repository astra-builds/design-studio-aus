"use client";

import Link from "next/link";
import { useState } from "react";
import { services } from "@/lib/studio";

export function ServiceIndex() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <ul className="lg:col-span-7">
        {services.map((s, i) => (
          <li key={s.n} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className="border-t border-ink/20 last:border-b">
            <Link href={`/begin?kind=${s.kind}`} className="group block py-7 md:py-9">
              <div className="flex items-baseline gap-6 md:gap-10">
                <span className="eyebrow w-8 shrink-0 text-ink/40">{s.n}</span>
                <h3
                  className={`display flex-1 text-[clamp(2.1rem,4.4vw,4.2rem)] transition-all duration-700 ${
                    active === i ? "translate-x-3 italic text-clay" : ""
                  }`}
                  style={{ transitionTimingFunction: "var(--ease)" }}
                >
                  {s.title}
                </h3>
                <span className="eyebrow hidden shrink-0 text-ink/45 md:block">{s.from}</span>
                <span
                  className={`hidden text-2xl transition-all duration-700 md:block ${active === i ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
                >
                  →
                </span>
              </div>
              <div
                className={`grid transition-all duration-700 ${active === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 max-lg:grid-rows-[1fr] max-lg:opacity-100"}`}
                style={{ transitionTimingFunction: "var(--ease)" }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-xl pl-14 pt-4 text-[0.98rem] leading-relaxed text-ink/65 md:pl-[4.5rem]">{s.text}</p>
                  <p className="eyebrow pl-14 pt-3 text-ink/45 md:hidden">{s.from}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative hidden lg:col-span-5 lg:block">
        <div className="sticky top-28">
          <div className="arch relative aspect-[3/4] w-full overflow-hidden bg-plaster">
            {services.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.n}
                src={s.image}
                alt={s.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms]"
                style={{
                  objectPosition: s.position,
                  opacity: active === i ? 1 : 0,
                  transform: active === i ? "scale(1)" : "scale(1.12)",
                  transitionTimingFunction: "var(--ease)",
                }}
              />
            ))}
          </div>
          <p className="eyebrow mt-5 text-ink/45">
            {services[active].n} / {String(services.length).padStart(2, "0")} — {services[active].title}
          </p>
        </div>
      </div>
    </div>
  );
}
