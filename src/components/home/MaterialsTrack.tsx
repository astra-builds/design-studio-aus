"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { IMG } from "@/lib/studio";

const mats = [
  {
    name: "Travertine",
    note: "Honed, filled, cut from a single block so the vein runs through the table.",
    meta: "Quarried · honed",
    bg: "repeating-linear-gradient(176deg, rgba(120,95,60,.10) 0 2px, transparent 2px 14px), repeating-linear-gradient(178deg, rgba(255,255,255,.2) 0 6px, transparent 6px 31px), linear-gradient(180deg,#e6d8bd,#d2bf9d)",
  },
  {
    name: "Spotted gum",
    note: "New South Wales hardwood from certified forests — stained deep, left to age.",
    meta: "FSC certified · NSW",
    bg: "repeating-linear-gradient(92deg, rgba(0,0,0,.2) 0 1px, transparent 1px 7px), repeating-linear-gradient(88deg, rgba(190,140,90,.14) 0 2px, transparent 2px 19px), radial-gradient(circle at 30% 22%, rgba(220,170,110,.28) 0 6px, transparent 7px), radial-gradient(circle at 70% 62%, rgba(220,170,110,.22) 0 5px, transparent 6px), linear-gradient(180deg,#5a3a26,#3d2517)",
  },
  {
    name: "Tadelakt",
    note: "Lime plaster burnished with river stones until it glows like skin.",
    meta: "Hand-applied · waterproof",
    bg: "radial-gradient(ellipse at 30% 25%, rgba(235,160,110,.6), transparent 55%), radial-gradient(ellipse at 75% 82%, rgba(70,30,15,.55), transparent 60%), linear-gradient(160deg,#b76a43,#8a4527)",
  },
  {
    name: "Aged brass",
    note: "Unlacquered, so every hand that turns the tap writes into the surface.",
    meta: "Unlacquered · patinates",
    bg: "conic-gradient(from 210deg at 50% 40%, #6f5320, #d9b45a, #8b6a2a, #e8c878, #6f5320)",
  },
  {
    name: "Washed linen",
    note: "Belgian flax, stonewashed until it forgets it was ever new.",
    meta: "Flax · stonewashed",
    bg: "repeating-linear-gradient(0deg, rgba(90,70,40,.11) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(90,70,40,.11) 0 1px, transparent 1px 4px), linear-gradient(#e9e0cf,#d9ccb4)",
  },
  {
    name: "Honed limestone",
    note: "Cool underfoot, warm to the eye. The quiet partner to dark timber.",
    meta: "Australian · honed",
    bg: "radial-gradient(circle at 20% 30%, rgba(90,80,60,.4) 0 1px, transparent 2px) 0 0/37px 41px, radial-gradient(circle at 60% 70%, rgba(90,80,60,.3) 0 1px, transparent 2px) 0 0/53px 47px, linear-gradient(180deg,#dcd6c6,#c7c0ac)",
  },
  {
    name: "Terrazzo",
    note: "Cast locally, with chips of terracotta salvaged from the building's own floor.",
    meta: "Cast in Melbourne",
    bg: "radial-gradient(circle at 15% 20%, #a4532f 0 7px, transparent 8px), radial-gradient(circle at 70% 15%, #7c8670 0 5px, transparent 6px), radial-gradient(circle at 40% 55%, #b8893c 0 8px, transparent 9px), radial-gradient(circle at 85% 65%, #3b2b21 0 6px, transparent 7px), radial-gradient(circle at 25% 85%, #7c8670 0 6px, transparent 7px), radial-gradient(circle at 60% 90%, #a4532f 0 5px, transparent 6px), #e8e0d0",
  },
];

export function MaterialsTrack() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = section.current;
    const t = track.current;
    const b = bar.current;
    if (!s || !t || !b) return;
    let raf = 0;
    const size = () => {
      const max = Math.max(0, t.scrollWidth - window.innerWidth);
      s.style.height = `${max + window.innerHeight}px`;
    };
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const max = Math.max(0, t.scrollWidth - window.innerWidth);
      t.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
      b.style.transform = `scaleX(${p})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      size();
      on();
    };
    size();
    update();
    const late = window.setTimeout(onResize, 600);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(late);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} id="materials" data-theme="dark" className="relative bg-ink text-bone">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={track} className="flex h-full w-max items-center gap-[6vw] px-[6vw] will-change-transform md:px-[8vw]">
          {/* Intro panel */}
          <div className="flex w-[86vw] shrink-0 flex-col justify-center gap-8 md:w-[56vw] md:flex-row md:items-center md:gap-14">
            <div className="md:w-[52%]">
              <p className="eyebrow mb-6 text-bone/50">(02) Material library</p>
              <h2 className="display text-[clamp(2.8rem,6.4vw,6.4rem)]">
                A palette begins <br />
                <em className="font-light text-sand">with the ground.</em>
              </h2>
              <p className="mt-8 max-w-sm text-[0.98rem] leading-relaxed text-bone/65">
                Before we draw a wall, we gather stone, timber, plaster and cloth on a table and live with them. Our Paddington library holds more than 600 samples — most of them Australian, all of them touched.
              </p>
              <p className="eyebrow mt-10 flex items-center gap-4 text-bone/50">
                Keep scrolling <span className="block h-px w-14 bg-bone/40" />
              </p>
            </div>
            <div className="hidden h-[64svh] w-[40%] shrink-0 overflow-hidden arch md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.materials} alt="Overhead view of stone, timber, brass and fabric samples" className="h-full w-full object-cover" />
            </div>
          </div>

          {mats.map((m, i) => (
            <figure key={m.name} className="flex shrink-0 flex-col" style={{ width: "clamp(230px, 24vw, 340px)", marginTop: i % 2 ? "6vh" : "-4vh" }}>
              <div
                className="tex arch relative h-[52svh] w-full overflow-hidden shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
                style={{ background: m.bg }}
              />
              <figcaption className="mt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="display text-4xl italic">{m.name}</span>
                  <span className="eyebrow !text-[0.6rem] text-bone/40">0{i + 1}</span>
                </div>
                <p className="eyebrow mt-2 !text-[0.6rem] text-ochre">{m.meta}</p>
                <p className="mt-3 text-sm leading-relaxed text-bone/60">{m.note}</p>
              </figcaption>
            </figure>
          ))}

          <div className="flex w-[80vw] shrink-0 flex-col items-start justify-center md:w-[34vw]">
            <p className="display text-[clamp(2.6rem,5vw,5rem)]">
              Come and <em className="font-light text-sand">touch</em> them.
            </p>
            <p className="mt-6 max-w-xs text-bone/60">Every first consultation includes a table of samples chosen for your project.</p>
            <Link href="/begin?step=book" className="btn btn-light mt-10">
              Book a materials session
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-[6vw] bottom-8 h-px bg-bone/15 md:inset-x-[8vw]">
          <div ref={bar} className="h-full origin-left bg-bone" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
