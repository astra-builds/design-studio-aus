import { enquiries, outbox } from "@/db/schema";
import { demoCreateEnquiry, demoCreateMessages, demoCreateQuote, demoUpdateEnquiry, demoUpdateMessage } from "@/lib/demo-store";
import { qualify } from "@/lib/qualify";
import { STUDIO } from "@/lib/studio";
import { aud, type QuoteResult } from "@/lib/quote";
import { formatSlot } from "@/lib/slots";

export type EnquiryData = {
  source: "journey" | "concierge" | "contact";
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  projectType?: string | null;
  location?: string | null;
  sqm?: number | null;
  scope?: string | null;
  level?: string | null;
  budgetLabel?: string | null;
  budgetValue?: number | null;
  timeline?: string | null;
  ownership?: string | null;
  direction?: string | null;
  moods?: string[] | null;
  notes?: string | null;
  booked?: boolean;
};

function newRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `HR-${s}`;
}

export async function upsertEnquiry(data: EnquiryData, existingId?: number) {
  const q = qualify({ ...data });
  const values = {
    source: data.source,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    projectType: data.projectType ?? null,
    location: data.location ?? null,
    sqm: data.sqm ?? null,
    scope: data.scope ?? null,
    level: data.level ?? null,
    budgetLabel: data.budgetLabel ?? null,
    budgetValue: data.budgetValue ?? null,
    timeline: data.timeline ?? null,
    ownership: data.ownership ?? null,
    direction: data.direction ?? null,
    moods: data.moods ?? null,
    notes: data.notes ?? null,
    score: q.score,
    tier: q.tier,
    reasons: q.reasons,
  };
  if (existingId) {
    const row = demoUpdateEnquiry(existingId, values);
    if (!row) throw new Error("Enquiry not found");
    return { enquiry: row, qualification: q, created: false };
  }
  const row = demoCreateEnquiry({ ...values, ref: newRef(), status: "new" });
  return { enquiry: row, qualification: q, created: true };
}

export async function saveQuote(enquiryId: number, inputs: Record<string, unknown>, r: QuoteResult) {
  demoCreateQuote({
    enquiryId,
    inputs,
    lowFee: r.lowFee,
    highFee: r.highFee,
    lowBudget: r.lowBudget,
    highBudget: r.highBudget,
  });
}

async function deliver(id: number, to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${STUDIO.name} <${STUDIO.email}>`,
        to: [to],
        subject,
        text,
      }),
    });
    demoUpdateMessage(id, res.ok ? "sent" : "failed");
  } catch {
    demoUpdateMessage(id, "failed");
  }
}

export async function queueMessages(opts: {
  enquiry: typeof enquiries.$inferSelect;
  tier: string;
  nextAction: string;
  slotIso?: string;
  kind?: string;
  quote?: QuoteResult | null;
  directionName?: string | null;
}) {
  const { enquiry: e } = opts;
  const first = (e.name ?? "there").split(" ")[0];
  const lines: string[] = [];
  lines.push(`Dear ${first},`, "");
  lines.push(
    `Thank you for writing to ${STUDIO.name}. Your enquiry reference is ${e.ref} — we've set it aside for a designer to read personally.`,
    "",
  );
  if (opts.slotIso) {
    const kindLabel = opts.kind === "video" ? "Video call" : opts.kind === "site" ? "Site visit" : "Studio visit";
    lines.push(`Your consultation: ${formatSlot(opts.slotIso)} — ${kindLabel}.`);
    if (opts.kind !== "video" && opts.kind !== "site")
      lines.push(`We're at ${STUDIO.address.join(", ")}. There's coffee, and a table of materials waiting.`);
    lines.push("");
  }
  if (opts.directionName) lines.push(`The direction we sketched for you: ${opts.directionName}.`);
  if (opts.quote)
    lines.push(
      `Indicative project budget: ${aud(opts.quote.lowBudget)} – ${aud(opts.quote.highBudget)}.`,
      `Indicative design fee: ${aud(opts.quote.lowFee)} – ${aud(opts.quote.highFee)} + GST.`,
    );
  lines.push(
    "",
    "Before we meet, it helps to bring: a few images you love, any plans, and a list of what's not working in your home today.",
    "",
    `You can reply to this email or message us on WhatsApp (+${STUDIO.whatsapp}) at any time.`,
    "",
    "Warmly,",
    `The ${STUDIO.name} studio`,
  );
  const clientBody = lines.join("\n");

  const rows: Array<{
    enquiryId: number | null;
    channel: string;
    audience: string;
    toAddr: string | null;
    subject?: string | null;
    body: string;
  }> = [];
  if (e.email)
    rows.push({
      enquiryId: e.id,
      channel: "email",
      audience: "client",
      toAddr: e.email,
      subject: opts.slotIso ? `Your consultation with ${STUDIO.name} · ${e.ref}` : `We've received your enquiry · ${e.ref}`,
      body: clientBody,
    });
  if (e.phone)
    rows.push({
      enquiryId: e.id,
      channel: "whatsapp",
      audience: "client",
      toAddr: e.phone,
      body: `Hi ${first}, it's ${STUDIO.name}. We've received your enquiry (${e.ref})${opts.slotIso ? ` and held ${formatSlot(opts.slotIso)} for you` : ""}. A designer will message you here shortly.`,
    });
  rows.push({
    enquiryId: e.id,
    channel: "email",
    audience: "studio",
    toAddr: STUDIO.email,
    subject: `[${opts.tier}] New enquiry ${e.ref} — ${e.projectType ?? "Project"}${e.location ? ` · ${e.location}` : ""}`,
    body: [
      `${e.name ?? "Unknown"} <${e.email ?? "no email"}> ${e.phone ?? ""}`,
      `Source: ${e.source} · Tier: ${opts.tier} (score ${e.score})`,
      `Project: ${e.projectType ?? "—"} · ${e.sqm ?? "?"} m² · ${e.location ?? "—"}`,
      `Scope: ${e.scope ?? "—"} · Level: ${e.level ?? "—"} · Timeline: ${e.timeline ?? "—"}`,
      `Budget: ${e.budgetLabel ?? "—"}`,
      opts.slotIso ? `Consultation: ${formatSlot(opts.slotIso)}` : "",
      e.notes ? `Notes: ${e.notes}` : "",
      "",
      `Suggested next action: ${opts.nextAction}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const inserted = demoCreateMessages(rows);
  // fire-and-forget delivery if an email provider is configured
  for (const r of inserted) {
    if (r.channel === "email" && r.toAddr && r.subject) await deliver(r.id, r.toAddr, r.subject, r.body);
  }
}
