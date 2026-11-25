"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IMG, STUDIO, directions, moods, pickDirection, waLink } from "@/lib/studio";
import { aud, estimate, type Kind, type Level, type Scope } from "@/lib/quote";

type SlotDay = {
  date: string;
  label: string;
  weekday: string;
  day: number;
  month: string;
  slots: { iso: string; time: string; available: boolean }[];
};

const KINDS: { id: Kind; title: string; text: string }[] = [
  { id: "home", title: "A new home", text: "Designing from the ground up" },
  { id: "renovation", title: "A renovation", text: "Re-working a home you already have" },
  { id: "apartment", title: "An apartment", text: "Compact, considered, full of light" },
  { id: "coastal", title: "A retreat", text: "A coastal, bush or holiday home" },
  { id: "hospitality", title: "Hospitality", text: "A restaurant, bar, café or hotel" },
  { id: "commercial", title: "Work or retail", text: "A studio, showroom or boutique" },
];

const SCOPES: { id: Scope; title: string; text: string }[] = [
  { id: "concept", title: "Concept", text: "Mood, layouts and materials — a clear direction to take forward" },
  { id: "documentation", title: "Design & documentation", text: "Full drawings and specifications, ready to build" },
  { id: "full", title: "Full service", text: "We run it through to installation and styling" },
];

const LEVELS: { id: Level; title: string; text: string }[] = [
  { id: "considered", title: "Considered", text: "Honest, well-made, quietly beautiful" },
  { id: "refined", title: "Refined", text: "Custom joinery, natural stone, bespoke lighting" },
  { id: "exceptional", title: "Exceptional", text: "Heirloom materials and commissioned pieces" },
];

const STATES = ["NSW", "VIC", "QLD", "TAS", "WA", "SA", "ACT", "NT"];
const TIMELINES = ["Immediately (ASAP)", "Within 3 months", "3–6 months", "6–12 months", "Just exploring"];
const OWNERSHIP = ["I own the property", "Buying / settling soon", "Still searching", "Leasing / venue operator"];
const MEETINGS = [
  { id: "studio", label: "Studio visit", sub: "Paddington, Sydney" },
  { id: "video", label: "Video call", sub: "From anywhere" },
  { id: "site", label: "Site visit", sub: "We come to you" },
] as const;

const STEP_TITLES = [
  ["What are we", "designing?"],
  ["What does", "home feel like?"],
  ["Tell us about", "the space."],
  ["Here is your", "direction."],
  ["We'll see you", "soon."],
];

function Num({ value }: { value: number }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      const e = 1 - Math.pow(1 - p, 4);
      const cur = start + (value - start) * e;
      setV(cur);
      from.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{aud(Math.round(v / 500) * 500)}</>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-3 text-sm transition-all duration-500 ${
        active ? "border-ink bg-ink text-bone" : "border-ink/25 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Radio<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; title: string; text: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-2xl border p-5 text-left transition-all duration-500 ${
            value === o.id ? "border-ink bg-ink text-bone" : "border-ink/20 hover:border-ink/60"
          }`}
        >
          <span className="display block text-2xl italic">{o.title}</span>
          <span className={`mt-2 block text-[0.82rem] leading-snug ${value === o.id ? "text-bone/70" : "text-ink/55"}`}>{o.text}</span>
        </button>
      ))}
    </div>
  );
}

function fmtSlot(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function fmtDay(iso: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
}

function icsFor(iso: string, ref: string, kind: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 45 * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Halden Rowe//Consultation//EN",
    "BEGIN:VEVENT",
    `UID:${ref}@haldenrowe.com.au`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:Consultation with Halden Rowe (${ref})`,
    `LOCATION:${kind === "studio" ? STUDIO.address.join(", ") : kind === "video" ? "Video call — link to follow" : "Your site"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
}

export function Journey() {
  const params = useSearchParams();
  const initialKind = params.get("kind") as Kind | null;
  const stepParam = params.get("step");
  const startStep = stepParam === "mood" ? 1 : stepParam === "space" ? 2 : stepParam === "book" ? 3 : initialKind ? 1 : 0;

  const [step, setStep] = useState(startStep);
  const [kind, setKind] = useState<Kind>(KINDS.some((k) => k.id === initialKind) ? (initialKind as Kind) : "home");
  const [picked, setPicked] = useState<string[]>([]);
  const [sqm, setSqm] = useState(180);
  const [scope, setScope] = useState<Scope>("documentation");
  const [level, setLevel] = useState<Level>("refined");
  const [state, setState] = useState("NSW");
  const [suburb, setSuburb] = useState("");
  const [timeline, setTimeline] = useState("3–6 months");
  const [ownership, setOwnership] = useState("I own the property");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<SlotDay[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<"studio" | "video" | "site">("studio");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ ref: string; slotIso: string | null } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepParam === "mood") setStep(1);
    else if (stepParam === "space") setStep(2);
    else if (stepParam === "book") setStep(3);
  }, [stepParam]);

  const direction = useMemo(() => pickDirection(picked), [picked]);
  const q = useMemo(() => estimate({ kind, sqm, scope, level, state }), [kind, sqm, scope, level, state]);

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((d: { days: SlotDay[] }) => {
        setDays(d.days);
        const first = d.days.findIndex((x) => x.slots.some((s) => s.available));
        if (first >= 0) setDayIdx(first);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const toggleMood = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? [...p.slice(1), id] : [...p, id]));

  const submit = async () => {
    setError("");
    if (name.trim().length < 2) return setError("Please tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("That email doesn't look quite right.");
    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, kind, sqm, scope, level, state, suburb, timeline, ownership,
          moods: picked, notes, slotIso: slot ?? undefined, meetingKind: meeting,
        }),
      });
      const data = (await res.json()) as { ref?: string; slotIso?: string | null; error?: string };
      if (!res.ok || !data.ref) {
        setError(data.error ?? "Something went wrong — please try again.");
        if (res.status === 409) {
          setSlot(null);
          fetch("/api/slots").then((r) => r.json()).then((d: { days: SlotDay[] }) => setDays(d.days));
        }
        return;
      }
      setDone({ ref: data.ref, slotIso: data.slotIso ?? null });
      setStep(4);
    } catch {
      setError("We couldn't reach the studio — please check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const panelImages = [
    { src: IMG.living, pos: "30% 50%" },
    { src: IMG.materials, pos: "50% 50%" },
    { src: IMG.studio, pos: "50% 50%" },
    { src: direction.image, pos: direction.position ?? "50% 50%" },
    { src: IMG.detail, pos: "50% 45%" },
  ];

  const whatsappText = done
    ? `Hi Halden Rowe — it's ${name.split(" ")[0]}. I've just sent a brief (${done.ref}): ${KINDS.find((k) => k.id === kind)?.title.toLowerCase()}, ~${sqm} m², ${suburb || state}. Direction: ${direction.name}.`
    : "";

  const day = days[dayIdx];

  return (
    <main className="min-h-[100svh] lg:grid lg:grid-cols-[5fr_7fr]">
      {/* ───── Left: cinematic panel ───── */}
      <aside data-theme="dark" className="relative hidden bg-ink lg:block">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {panelImages.map((im, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i === 3 ? `d-${direction.id}` : i}
              src={im.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-all duration-[1600ms]"
              style={{
                objectPosition: im.pos,
                opacity: step === i ? 1 : 0,
                transform: step === i ? "scale(1)" : "scale(1.12)",
                transitionTimingFunction: "var(--ease)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-ink/40" />
          <div className="absolute inset-x-12 bottom-14 text-bone">
            <p className="eyebrow mb-6 text-bone/70">
              {step < 4 ? `Step ${String(step + 1).padStart(2, "0")} of 04` : "Consultation held"}
            </p>
            <h1 key={step} className="display text-[clamp(3.4rem,5.6vw,6.4rem)] italic leading-[0.92]" style={{ animation: "fadeIn 1.2s var(--ease) both" }}>
              {STEP_TITLES[step][0]}
              <br />
              <span className="font-light not-italic text-sand">{STEP_TITLES[step][1]}</span>
            </h1>
          </div>
        </div>
      </aside>

      {/* ───── Right: the conversation ───── */}
      <section data-theme="light" className="relative px-6 pb-28 pt-28 md:px-14 lg:pt-32 xl:px-20">
        <div ref={top} className="absolute -top-24" />
        <div className="mx-auto max-w-3xl">
          {/* progress */}
          {step < 4 && (
            <div className="mb-10 flex items-center gap-4">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="eyebrow ulink shrink-0" aria-label="Back">
                  ← Back
                </button>
              )}
              <div className="flex flex-1 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    disabled={i > step}
                    onClick={() => setStep(i)}
                    className="group h-5 flex-1"
                    aria-label={`Step ${i + 1}`}
                  >
                    <span className="block h-px w-full bg-ink/20">
                      <span className="block h-[2px] origin-left bg-clay transition-transform duration-1000" style={{ transform: `scaleX(${i <= step ? 1 : 0})`, transitionTimingFunction: "var(--ease)" }} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <h1 className="display mb-10 text-[clamp(3rem,10vw,4.5rem)] italic leading-[0.95] lg:hidden">
            {STEP_TITLES[step].join(" ")}
          </h1>

          <div key={step} style={{ animation: "fadeIn 1s var(--ease) both" }}>
            {/* STEP 0 — what */}
            {step === 0 && (
              <div>
                <p className="mb-10 max-w-md text-[1.05rem] leading-relaxed text-ink/65">
                  A few gentle questions, then a design direction and an honest range for budget and fees. No sign-up, nothing to download.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {KINDS.map((k, i) => (
                    <button
                      key={k.id}
                      onClick={() => {
                        setKind(k.id);
                        window.setTimeout(() => setStep(1), 380);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500 ${
                        kind === k.id ? "border-ink bg-ink text-bone" : "border-ink/20 hover:border-ink"
                      }`}
                      style={{ animation: `fadeIn .9s var(--ease) ${i * 0.07}s both` }}
                    >
                      <span className="eyebrow !text-[0.6rem] opacity-50">0{i + 1}</span>
                      <span className="display mt-6 block text-[2.1rem] italic leading-none transition-transform duration-500 group-hover:translate-x-1.5">{k.title}</span>
                      <span className={`mt-3 block text-sm ${kind === k.id ? "text-bone/65" : "text-ink/55"}`}>{k.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — mood */}
            {step === 1 && (
              <div>
                <p className="mb-8 max-w-md text-[1.05rem] leading-relaxed text-ink/65">
                  Choose up to three images that feel like the way you want to live. Trust your gut — there are no wrong answers.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {moods.map((m, i) => {
                    const on = picked.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMood(m.id)}
                        className="group text-left"
                        aria-pressed={on}
                        style={{ animation: `fadeIn .9s var(--ease) ${i * 0.06}s both` }}
                      >
                        <span className={`arch relative block aspect-[3/4] overflow-hidden ring-offset-4 ring-offset-bone transition-all duration-500 ${on ? "ring-2 ring-clay" : "ring-0"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.image}
                            alt={m.label}
                            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110 ${on ? "scale-105" : ""}`}
                            style={{ objectPosition: m.position, transitionTimingFunction: "var(--ease)" }}
                          />
                          <span className={`absolute inset-0 bg-ink/0 transition-colors duration-500 ${on ? "bg-clay/15" : "group-hover:bg-ink/10"}`} />
                          {on && (
                            <span className="absolute bottom-3 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-clay text-sm text-bone">
                              {picked.indexOf(m.id) + 1}
                            </span>
                          )}
                        </span>
                        <span className="display mt-3 block text-xl italic leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-ink/15 pt-8">
                  <p className="text-sm text-ink/60">
                    {picked.length === 0 ? "Pick one to begin" : (
                      <>
                        Leaning toward <span className="display text-xl italic text-clay">{direction.name}</span>
                      </>
                    )}
                  </p>
                  <button className="btn btn-solid" onClick={() => setStep(2)}>
                    {picked.length ? "Continue" : "Skip for now"} →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — space */}
            {step === 2 && (
              <div className="space-y-12">
                <div>
                  <div className="mb-5 flex items-end justify-between">
                    <label className="eyebrow text-ink/55" htmlFor="sqm">Approximate size</label>
                    <p className="display text-6xl italic leading-none">
                      {sqm} <span className="text-2xl not-italic text-ink/50">m²</span>
                    </p>
                  </div>
                  <input id="sqm" type="range" min={30} max={600} step={10} value={sqm} onChange={(e) => setSqm(Number(e.target.value))} />
                  <div className="eyebrow mt-4 flex justify-between !text-[0.6rem] text-ink/40">
                    <span>Apartment</span>
                    <span>Family home</span>
                    <span>Estate</span>
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-4 text-ink/55">How far would you like us to go?</p>
                  <Radio options={SCOPES} value={scope} onChange={setScope} />
                </div>
                <div>
                  <p className="eyebrow mb-4 text-ink/55">The level of finish</p>
                  <Radio options={LEVELS} value={level} onChange={setLevel} />
                </div>

                <div>
                  <p className="eyebrow mb-4 text-ink/55">Where is it?</p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {STATES.map((s) => (
                      <Pill key={s} active={state === s} onClick={() => setState(s)}>{s}</Pill>
                    ))}
                  </div>
                  <input className="field" placeholder="Suburb or town — e.g. Bronte" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
                </div>

                <div className="grid gap-10 md:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-4 text-ink/55">When would you like to begin?</p>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map((t) => (
                        <Pill key={t} active={timeline === t} onClick={() => setTimeline(t)}>{t}</Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow mb-4 text-ink/55">The property</p>
                    <div className="flex flex-wrap gap-2">
                      {OWNERSHIP.map((t) => (
                        <Pill key={t} active={ownership === t} onClick={() => setOwnership(t)}>{t}</Pill>
                      ))}
                    </div>
                  </div>
                </div>

                {/* live estimate */}
                <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-bone md:p-10">
                  <p className="eyebrow mb-6 text-bone/50">Indicative — updates as you go</p>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="eyebrow !text-[0.6rem] text-ochre">Interior project budget</p>
                      <p className="display mt-2 text-4xl leading-none md:text-5xl">
                        <Num value={q.lowBudget} /> <span className="text-bone/40">–</span> <Num value={q.highBudget} />
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow !text-[0.6rem] text-ochre">Our design fee</p>
                      <p className="display mt-2 text-4xl leading-none md:text-5xl">
                        <Num value={q.lowFee} /> <span className="text-bone/40">–</span> <Num value={q.highFee} />
                      </p>
                    </div>
                  </div>
                  <p className="mt-8 text-sm leading-relaxed text-bone/55">
                    Design takes about {q.designWeeks[0]}–{q.designWeeks[1]} weeks; delivery typically {q.deliveryMonths[0]}–{q.deliveryMonths[1]} months. {q.notes[0]}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button className="btn btn-solid" onClick={() => setStep(3)}>
                    See your direction →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — direction, estimate, booking */}
            {step === 3 && (
              <div className="space-y-16">
                {/* Direction */}
                <div className="grid gap-8 md:grid-cols-[0.8fr_1fr]">
                  <div className="arch relative aspect-[3/4] overflow-hidden bg-plaster">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={direction.image} alt={direction.name} className="h-full w-full object-cover" style={{ objectPosition: direction.position }} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="eyebrow mb-4 text-clay">Your design direction</p>
                    <h2 className="display text-6xl italic leading-[0.95] md:text-7xl">{direction.name}</h2>
                    <p className="display mt-3 text-2xl text-ink/60">{direction.line}</p>
                    <p className="mt-6 leading-relaxed text-ink/70">{direction.description}</p>
                    <div className="mt-6 flex gap-2">
                      {direction.palette.map((c) => (
                        <span key={c} className="block h-9 w-9 rounded-full ring-1 ring-ink/10" style={{ background: c }} title={c} />
                      ))}
                    </div>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {direction.materials.map((m) => (
                        <li key={m} className="rounded-full border border-ink/20 px-3 py-1.5 text-xs">{m}</li>
                      ))}
                    </ul>
                    <p className="mt-6 text-sm text-ink/55">
                      See it in practice:{" "}
                      <a className="ulink text-ink" href={`/work/${direction.project}`} target="_blank" rel="noreferrer">
                        {direction.project.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())} ↗
                      </a>
                    </p>
                    <p className="mt-2 text-sm text-ink/55">Suggested services: {direction.services.join(" · ")}</p>
                  </div>
                </div>

                {/* Estimate */}
                <div className="rounded-3xl bg-plaster p-8 md:p-10">
                  <p className="eyebrow mb-6 text-ink/50">Your indicative range</p>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="eyebrow !text-[0.6rem] text-clay">Interior budget</p>
                      <p className="display mt-2 text-4xl leading-none md:text-5xl">
                        {aud(q.lowBudget)} – {aud(q.highBudget)}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow !text-[0.6rem] text-clay">Design fee + GST</p>
                      <p className="display mt-2 text-4xl leading-none md:text-5xl">
                        {aud(q.lowFee)} – {aud(q.highFee)}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-8 space-y-1.5 text-sm text-ink/60">
                    {q.notes.map((n) => (
                      <li key={n}>— {n}</li>
                    ))}
                  </ul>
                  <button onClick={() => setStep(2)} className="eyebrow ulink mt-6">Adjust details</button>
                </div>

                {/* Booking */}
                <div>
                  <p className="eyebrow mb-3 text-clay">Complimentary first consultation · 45 minutes</p>
                  <h2 className="display mb-8 text-5xl leading-none md:text-6xl">
                    Hold a time with <em className="font-light">a designer.</em>
                  </h2>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {MEETINGS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMeeting(m.id)}
                        className={`rounded-2xl border px-5 py-3 text-left transition-all duration-500 ${meeting === m.id ? "border-ink bg-ink text-bone" : "border-ink/20 hover:border-ink"}`}
                      >
                        <span className="block text-sm">{m.label}</span>
                        <span className={`block text-xs ${meeting === m.id ? "text-bone/60" : "text-ink/50"}`}>{m.sub}</span>
                      </button>
                    ))}
                  </div>

                  {days.length === 0 ? (
                    <p className="py-8 text-sm text-ink/50">Checking the diary…</p>
                  ) : (
                    <>
                      <div className="no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2 pb-3">
                        {days.map((d, i) => {
                          const avail = d.slots.some((s) => s.available);
                          return (
                            <button
                              key={d.date}
                              disabled={!avail}
                              onClick={() => {
                                setDayIdx(i);
                                setSlot(null);
                              }}
                              className={`flex w-[4.6rem] shrink-0 flex-col items-center rounded-2xl border py-4 transition-all duration-500 disabled:opacity-30 ${
                                dayIdx === i ? "border-ink bg-ink text-bone" : "border-ink/20 hover:border-ink"
                              }`}
                            >
                              <span className="eyebrow !text-[0.58rem] opacity-60">{d.weekday}</span>
                              <span className="display text-3xl leading-none">{d.day}</span>
                              <span className="eyebrow !text-[0.58rem] opacity-60">{d.month}</span>
                            </button>
                          );
                        })}
                      </div>
                      {day && (
                        <div className="mt-5">
                          <p className="mb-3 text-sm text-ink/55">{day.label} · Sydney time</p>
                          <div className="flex flex-wrap gap-2">
                            {day.slots.map((s) => (
                              <button
                                key={s.iso}
                                disabled={!s.available}
                                onClick={() => setSlot(s.iso)}
                                className={`rounded-full border px-6 py-3 text-sm transition-all duration-500 disabled:cursor-not-allowed disabled:line-through disabled:opacity-30 ${
                                  slot === s.iso ? "border-clay bg-clay text-bone" : "border-ink/25 hover:border-ink"
                                }`}
                              >
                                {s.time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Contact */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
                    <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <input className="field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <input className="field md:col-span-2" placeholder="Mobile / WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                  </div>
                  <textarea
                    className="field min-h-24 resize-none"
                    placeholder="Anything we should know? A favourite room, a nagging problem, a dream…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  {error && <p className="text-sm text-clay" role="alert">{error}</p>}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <button type="submit" disabled={busy} className="btn btn-solid">
                      {busy ? "Sending…" : slot ? "Confirm consultation" : "Send my brief"} →
                    </button>
                    <p className="max-w-xs text-xs leading-relaxed text-ink/50">
                      {slot ? `${fmtSlot(slot)} (Sydney). ` : "Choose a time above to hold it — or send your brief and we'll reach out. "}
                      We reply from a real inbox.
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4 — done */}
            {step === 4 && done && (
              <div className="space-y-12">
                <div className="rounded-3xl bg-ink p-8 text-bone md:p-12">
                  <p className="eyebrow mb-6 text-bone/50">Reference {done.ref}</p>
                  {done.slotIso ? (
                    <>
                      <p className="display text-4xl leading-[1.05] md:text-6xl">
                        {fmtDay(done.slotIso)}
                        <br />
                        <em className="font-light text-sand">at {fmtTime(done.slotIso)}</em>
                      </p>
                      <p className="eyebrow mt-6 text-bone/60">
                        {MEETINGS.find((m) => m.id === meeting)?.label} · Sydney time
                        {meeting === "studio" ? ` · ${STUDIO.address.join(", ")}` : ""}
                      </p>
                    </>
                  ) : (
                    <p className="display text-4xl leading-[1.05] md:text-6xl">
                      Your brief is with <em className="font-light text-sand">the studio.</em>
                    </p>
                  )}
                </div>

                <ol className="space-y-6">
                  {[
                    ["A confirmation is on its way", `We've sent the details to ${email}. If you shared your mobile, we've queued a WhatsApp note too.`],
                    ["A designer reads your brief", `${direction.name} · ${aud(q.lowBudget)}–${aud(q.highBudget)} · ${sqm} m². They'll prepare a table of samples before you meet.`],
                    ["We'll be in touch within one business day", "Sooner if it's urgent — message us on WhatsApp any time."],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-6 border-t border-ink/15 pt-6">
                      <span className="display text-4xl italic text-clay">0{i + 1}</span>
                      <div>
                        <p className="display text-3xl">{t}</p>
                        <p className="mt-2 max-w-md text-ink/60">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="flex flex-wrap gap-4">
                  <a href={waLink(whatsappText)} target="_blank" rel="noreferrer" className="btn btn-solid">
                    Continue on WhatsApp ↗
                  </a>
                  {done.slotIso && (
                    <a href={icsFor(done.slotIso, done.ref, meeting)} download={`halden-rowe-${done.ref}.ics`} className="btn">
                      Add to calendar
                    </a>
                  )}
                  <Link href="/work" className="btn">
                    Browse our work
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
