"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Message = { id: number; channel: string; audience: string; toAddr: string | null; subject: string | null; body: string; status: string; createdAt: string };
type Enquiry = {
  id: number;
  ref: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  projectType: string | null;
  location: string | null;
  sqm: number | null;
  scope: string | null;
  level: string | null;
  budgetLabel: string | null;
  timeline: string | null;
  ownership: string | null;
  direction: string | null;
  notes: string | null;
  score: number;
  tier: string;
  reasons: string[] | null;
  status: string;
  createdAt: string;
  booking: { slotStart: string; kind: string } | null;
  messages: Message[];
  transcript: { role: string; content: string }[] | null;
};

const STATUSES = ["new", "contacted", "consult", "proposal", "won", "archived"];
const tierStyle: Record<string, string> = {
  Priority: "bg-clay text-bone",
  Qualified: "bg-ochre/90 text-ink",
  Nurture: "bg-plaster text-ink",
};

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/admin/enquiries", { headers: { "x-admin-key": k } });
    if (!res.ok) {
      setErr("Incorrect passcode.");
      setAuthed(false);
      return;
    }
    const d = (await res.json()) as { enquiries: Enquiry[] };
    setRows(d.enquiries);
    setAuthed(true);
    setErr("");
    sessionStorage.setItem("hr-admin", k);
    setSel((s) => s ?? d.enquiries[0]?.id ?? null);
  }, []);

  useEffect(() => {
    const k = sessionStorage.getItem("hr-admin");
    if (k) {
      setKey(k);
      void load(k);
    }
  }, [load]);

  const setStatus = async (id: number, status: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "x-admin-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const list = useMemo(() => rows.filter((r) => filter === "all" || r.tier === filter), [rows, filter]);
  const current = rows.find((r) => r.id === sel) ?? null;

  if (!authed)
    return (
      <main data-theme="light" className="grid min-h-[100svh] place-items-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(key);
          }}
          className="w-full max-w-sm"
        >
          <p className="eyebrow mb-4 text-ink/50">Studio desk</p>
          <h1 className="display mb-8 text-6xl italic">Welcome back.</h1>
          <input className="field" type="password" placeholder="Passcode" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          {err && <p className="mt-3 text-sm text-clay">{err}</p>}
          <button className="btn btn-solid mt-8">Enter</button>
        </form>
      </main>
    );

  return (
    <main data-theme="light" className="min-h-[100svh] px-6 pb-16 pt-28 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3 text-ink/50">Studio desk · enquiries</p>
            <h1 className="display text-6xl italic">The inbox, sorted.</h1>
          </div>
          <div className="flex gap-2">
            {["all", "Priority", "Qualified", "Nurture"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`eyebrow rounded-full border px-4 py-2.5 ${filter === f ? "border-ink bg-ink text-bone" : "border-ink/20"}`}>
                {f} {f === "all" ? rows.length : rows.filter((r) => r.tier === f).length}
              </button>
            ))}
            <button onClick={() => load(key)} className="eyebrow rounded-full border border-ink/20 px-4 py-2.5">Refresh</button>
          </div>
        </div>

        {rows.length === 0 && <p className="py-20 text-ink/50">No enquiries yet. They&rsquo;ll appear here — scored and sorted — the moment someone writes in.</p>}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ul className="space-y-2">
            {list.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSel(r.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition-colors ${sel === r.id ? "border-ink bg-white/50" : "border-ink/15 hover:border-ink/50"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="display text-2xl">{r.name ?? "Unnamed"}</span>
                    <span className={`eyebrow rounded-full px-3 py-1.5 !text-[0.58rem] ${tierStyle[r.tier]}`}>
                      {r.tier} · {r.score}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">
                    {r.projectType ?? "Project"} · {r.location || "—"} · {r.sqm ? `${r.sqm} m²` : ""}
                  </p>
                  <div className="eyebrow mt-3 flex justify-between !text-[0.58rem] text-ink/45">
                    <span>{r.ref} · {r.source} · {r.status}</span>
                    <span>{r.booking ? `Booked ${when(r.booking.slotStart)}` : when(r.createdAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {current && (
            <div className="space-y-8 rounded-3xl border border-ink/15 bg-white/40 p-8 lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-ink/50">{current.ref} · {when(current.createdAt)}</p>
                  <h2 className="display mt-2 text-5xl">{current.name}</h2>
                  <p className="mt-2 text-sm text-ink/65">
                    {current.email} {current.phone && `· ${current.phone}`}
                  </p>
                </div>
                <span className={`eyebrow rounded-full px-4 py-2 ${tierStyle[current.tier]}`}>
                  {current.tier} · {current.score}/100
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatus(current.id, s)} className={`eyebrow rounded-full border px-3.5 py-2 !text-[0.6rem] ${current.status === s ? "border-clay bg-clay text-bone" : "border-ink/20"}`}>
                    {s}
                  </button>
                ))}
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  ["Project", current.projectType],
                  ["Location", current.location],
                  ["Size", current.sqm ? `${current.sqm} m²` : null],
                  ["Scope", current.scope],
                  ["Finish", current.level],
                  ["Budget", current.budgetLabel],
                  ["Timeline", current.timeline],
                  ["Property", current.ownership],
                  ["Direction", current.direction],
                  ["Consultation", current.booking ? `${when(current.booking.slotStart)} · ${current.booking.kind}` : null],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="eyebrow !text-[0.58rem] text-ink/45">{k}</dt>
                    <dd className="mt-1">{v ?? "—"}</dd>
                  </div>
                ))}
              </dl>

              {current.notes && (
                <div>
                  <p className="eyebrow mb-2 !text-[0.58rem] text-ink/45">Their words</p>
                  <p className="display text-2xl italic leading-snug">&ldquo;{current.notes}&rdquo;</p>
                </div>
              )}

              <div>
                <p className="eyebrow mb-3 !text-[0.58rem] text-ink/45">Why this score</p>
                <div className="flex flex-wrap gap-2">
                  {(current.reasons ?? []).map((x) => (
                    <span key={x} className="rounded-full border border-ink/20 px-3 py-1 text-xs">{x}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3 !text-[0.58rem] text-ink/45">Automated communications</p>
                <ul className="space-y-3">
                  {current.messages.map((m) => (
                    <li key={m.id}>
                      <details className="rounded-2xl border border-ink/15 p-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm">
                          <span>
                            <span className="eyebrow !text-[0.58rem] text-clay">{m.channel} → {m.audience}</span>
                            <span className="mt-1 block">{m.subject ?? m.body.slice(0, 70)}</span>
                          </span>
                          <span className="eyebrow !text-[0.58rem] text-ink/45">{m.status}</span>
                        </summary>
                        <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/70">{m.body}</pre>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>

              {current.transcript && (
                <div>
                  <p className="eyebrow mb-3 !text-[0.58rem] text-ink/45">Concierge transcript</p>
                  <div className="space-y-2 text-sm">
                    {current.transcript.map((t, i) => (
                      <p key={i} className={t.role === "user" ? "text-ink" : "text-ink/55"}>
                        <span className="eyebrow !text-[0.55rem] mr-2">{t.role === "user" ? "Guest" : "Concierge"}</span>
                        {t.content}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
