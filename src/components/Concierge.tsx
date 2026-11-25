"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { STUDIO, waLink } from "@/lib/studio";

type Msg = { role: "user" | "assistant"; content: string };
type Action = { label: string; href: string; external?: boolean };
type Lead = Record<string, unknown>;
type Turn = Msg & { actions?: Action[] };

const GREETING: Turn = {
  role: "assistant",
  content:
    "G'day — I'm the Halden Rowe concierge. Tell me a little about your space, or ask about fees, timing and availability. I can also set up a consultation with one of our designers.",
};
const START_CHIPS = ["I'm planning a project", "What does it cost?", "Book a consultation", "Talk to a person"];
const KEY = "hr-concierge-v1";

export function Concierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [chips, setChips] = useState<string[]>(START_CHIPS);
  const [lead, setLead] = useState<Lead>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string>("");
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // restore session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as { id: string; turns: Turn[]; lead: Lead; chips: string[] };
        sessionId.current = s.id;
        setTurns(s.turns);
        setLead(s.lead);
        setChips(s.chips);
      } else {
        sessionId.current = crypto.randomUUID();
      }
    } catch {
      sessionId.current = Math.random().toString(36).slice(2);
    }
    const t = window.setTimeout(() => {
      if (!sessionStorage.getItem(KEY + "-seen")) setTeaser(true);
    }, 12000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!sessionId.current) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ id: sessionId.current, turns, lead, chips }));
    } catch {}
  }, [turns, lead, chips]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-concierge", openHandler);
    return () => window.removeEventListener("open-concierge", openHandler);
  }, []);

  useEffect(() => {
    if (open) {
      setTeaser(false);
      try {
        sessionStorage.setItem(KEY + "-seen", "1");
      } catch {}
      window.setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      const next: Turn[] = [...turns, { role: "user", content }];
      setTurns(next);
      setInput("");
      setChips([]);
      setBusy(true);
      try {
        const [res] = await Promise.all([
          fetch("/api/concierge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionId.current,
              lead,
              messages: next.map(({ role, content: c }) => ({ role, content: c })),
            }),
          }),
          new Promise((r) => setTimeout(r, 700)),
        ]);
        const data = (await res.json()) as { reply: string; chips: string[]; actions: Action[]; lead: Lead };
        setTurns((t) => [...t, { role: "assistant", content: data.reply, actions: data.actions }]);
        setChips(data.chips ?? []);
        setLead(data.lead ?? lead);
      } catch {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: `Apologies — I lost the connection for a moment. You can always reach the studio on WhatsApp or at ${STUDIO.email}.`,
            actions: [{ label: "Open WhatsApp", href: waLink("Hi Halden Rowe"), external: true }],
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, lead, turns],
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 right-5 z-[140] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        {teaser && !open && (
          <div className="msg-in relative max-w-[260px] rounded-2xl rounded-br-sm bg-ink px-5 py-4 text-sm leading-snug text-bone shadow-2xl">
            <button
              onClick={() => {
                setTeaser(false);
                try {
                  sessionStorage.setItem(KEY + "-seen", "1");
                } catch {}
              }}
              aria-label="Dismiss"
              className="absolute right-2 top-1 text-bone/50 hover:text-bone"
            >
              ×
            </button>
            Planning a home, renovation or venue? <button className="underline underline-offset-4" onClick={() => setOpen(true)}>Ask us anything.</button>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close concierge" : "Open concierge"}
          className="group flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-bone shadow-[0_18px_50px_-12px_rgba(28,23,19,0.6)] transition-transform duration-500 hover:-translate-y-0.5"
        >
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-bone text-ink">
            <span className="block h-5 w-3.5 rounded-t-full border border-ink" />
            <span className="pulse-dot absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-clay" />
          </span>
          <span className="eyebrow !tracking-[0.18em]">{open ? "Close" : "Ask the studio"}</span>
        </button>
      </div>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-3 z-[141] flex h-[min(620px,calc(100svh-7.5rem))] w-[min(400px,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-bone text-ink shadow-[0_40px_120px_-20px_rgba(28,23,19,0.55)] ring-1 ring-ink/10 transition-all duration-700 md:right-8 md:bottom-28 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-95 opacity-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
        role="dialog"
        aria-label="Studio concierge"
        aria-hidden={!open}
      >
        <div className="relative flex items-center justify-between bg-ink px-6 py-5 text-bone">
          <div>
            <p className="display text-2xl italic leading-none">Studio concierge</p>
            <p className="eyebrow mt-2 !text-[0.6rem] text-bone/55">Answers instantly · designers follow up personally</p>
          </div>
          <a
            href={waLink("Hi Halden Rowe — I started a chat on your website.")}
            target="_blank"
            rel="noreferrer"
            className="eyebrow !text-[0.6rem] rounded-full border border-bone/30 px-3 py-2 transition-colors hover:bg-bone hover:text-ink"
          >
            WhatsApp
          </a>
        </div>

        <div ref={scroller} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {turns.map((t, i) => (
            <div key={i} className={`msg-in flex flex-col ${t.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed ${
                  t.role === "user" ? "rounded-br-sm bg-ink text-bone" : "rounded-bl-sm bg-plaster text-ink"
                }`}
              >
                {t.content}
              </div>
              {t.actions && t.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.actions.map((a) =>
                    a.external ? (
                      <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className="btn btn-solid !px-4 !py-2.5 !text-[0.62rem]">
                        {a.label} ↗
                      </a>
                    ) : (
                      <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className="btn btn-solid !px-4 !py-2.5 !text-[0.62rem]">
                        {a.label} →
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex w-fit gap-1.5 rounded-2xl rounded-bl-sm bg-plaster px-4 py-4">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="block h-1.5 w-1.5 rounded-full bg-ink"
                  style={{ animation: `typing 1.2s ${d * 0.16}s infinite` }}
                />
              ))}
            </div>
          )}
        </div>

        {chips.length > 0 && !busy && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="shrink-0 rounded-full border border-ink/25 px-4 py-2 text-xs transition-colors hover:bg-ink hover:text-bone"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-3 border-t border-ink/10 px-5 py-4"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your space, or ask a question…"
            className="flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-ink/40"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bone transition-colors hover:bg-clay disabled:opacity-30"
            aria-label="Send"
          >
            →
          </button>
        </form>
      </div>
    </>
  );
}
