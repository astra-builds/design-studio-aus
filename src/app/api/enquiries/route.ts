import { db } from "@/db";
import { bookings, enquiries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { estimate, type Kind, type Level, type Scope } from "@/lib/quote";
import { isValidSlot } from "@/lib/slots";
import { pickDirection } from "@/lib/studio";
import { queueMessages, saveQuote, upsertEnquiry } from "@/lib/leads";
import { qualify } from "@/lib/qualify";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  home: "New home",
  renovation: "Renovation",
  apartment: "Apartment",
  coastal: "Coastal / holiday home",
  hospitality: "Hospitality",
  commercial: "Commercial / retail",
};

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  kind?: Kind;
  sqm?: number;
  scope?: Scope;
  level?: Level;
  state?: string;
  suburb?: string;
  timeline?: string;
  ownership?: string;
  moods?: string[];
  notes?: string;
  slotIso?: string;
  meetingKind?: "studio" | "video" | "site";
};

export async function POST(req: Request) {
  let b: Body;
  try {
    b = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = (b.name ?? "").trim();
  const email = (b.email ?? "").trim();
  if (name.length < 2) return Response.json({ error: "Please tell us your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: "That email doesn't look quite right." }, { status: 400 });

  const kind = (b.kind ?? "home") as Kind;
  const scope = (b.scope ?? "documentation") as Scope;
  const level = (b.level ?? "refined") as Level;
  const sqm = Math.max(20, Math.min(2000, Number(b.sqm) || 150));
  const state = (b.state ?? "NSW").toUpperCase();
  const quote = estimate({ kind, sqm, scope, level, state });
  const direction = pickDirection(b.moods ?? []);
  const location = [b.suburb?.trim(), state].filter(Boolean).join(", ");
  const budgetValue = Math.round((quote.lowBudget + quote.highBudget) / 2);

  let slotIso: string | undefined;
  if (b.slotIso) {
    if (!isValidSlot(b.slotIso)) return Response.json({ error: "That time is no longer available." }, { status: 409 });
    const clash = await db.select().from(bookings).where(eq(bookings.slotStart, new Date(b.slotIso)));
    if (clash.length) return Response.json({ error: "That time was just taken — please choose another." }, { status: 409 });
    slotIso = b.slotIso;
  }

  const { enquiry, qualification } = await upsertEnquiry({
    source: "journey",
    name,
    email,
    phone: b.phone?.trim() || null,
    projectType: KIND_LABEL[kind] ?? kind,
    location,
    sqm,
    scope,
    level,
    budgetLabel: `${quote.lowBudget / 1000}k–${quote.highBudget / 1000}k (estimated)`,
    budgetValue,
    timeline: b.timeline ?? null,
    ownership: b.ownership ?? null,
    direction: direction.name,
    moods: b.moods ?? [],
    notes: b.notes?.trim() || null,
    booked: !!slotIso,
  });

  if (slotIso) {
    try {
      await db.insert(bookings).values({
        enquiryId: enquiry.id,
        slotStart: new Date(slotIso),
        kind: b.meetingKind ?? "studio",
      });
    } catch {
      await db.delete(enquiries).where(eq(enquiries.id, enquiry.id));
      return Response.json({ error: "That time was just taken — please choose another." }, { status: 409 });
    }
  }

  await saveQuote(enquiry.id, { kind, sqm, scope, level, state }, quote);
  const q = qualify({ ...enquiry, booked: !!slotIso, moods: b.moods ?? [] });
  await queueMessages({
    enquiry,
    tier: qualification.tier,
    nextAction: q.nextAction,
    slotIso,
    kind: b.meetingKind,
    quote,
    directionName: direction.name,
  });

  return Response.json({
    ref: enquiry.ref,
    tier: qualification.tier,
    slotIso: slotIso ?? null,
  });
}
