export type QualifyInput = {
  budgetValue?: number | null;
  timeline?: string | null;
  ownership?: string | null;
  scope?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  notes?: string | null;
  moods?: string[] | null;
  booked?: boolean;
};

export type Qualification = {
  score: number;
  tier: "Priority" | "Qualified" | "Nurture";
  reasons: string[];
  nextAction: string;
};

export function qualify(i: QualifyInput): Qualification {
  let score = 0;
  const reasons: string[] = [];
  const b = i.budgetValue ?? 0;

  if (b >= 500_000) { score += 30; reasons.push("Budget over $500k"); }
  else if (b >= 250_000) { score += 25; reasons.push("Budget $250k–$500k"); }
  else if (b >= 120_000) { score += 18; reasons.push("Budget $120k–$250k"); }
  else if (b >= 60_000) { score += 10; reasons.push("Budget $60k–$120k"); }
  else if (b > 0) { score += 4; reasons.push("Budget below usual minimum"); }

  const t = (i.timeline ?? "").toLowerCase();
  if (/asap|now|immediate|1.?3|within 3|this month|next month/.test(t)) { score += 20; reasons.push("Ready to start soon"); }
  else if (/3.?6|within 6|few months|6 months/.test(t)) { score += 15; reasons.push("Starting in 3–6 months"); }
  else if (/6.?12|next year|12/.test(t)) { score += 8; reasons.push("Planning ahead"); }
  else if (t) { score += 3; reasons.push("Early exploration"); }

  const o = (i.ownership ?? "").toLowerCase();
  if (/own/.test(o)) { score += 15; reasons.push("Owns the property"); }
  else if (/buy|settle|purchas/.test(o)) { score += 10; reasons.push("Purchasing the property"); }
  else if (/plan|search|look/.test(o)) { score += 6; }
  else if (o) score += 2;

  const s = i.scope ?? "";
  if (s === "full") { score += 15; reasons.push("Full-service scope"); }
  else if (s === "documentation") { score += 10; reasons.push("Design + documentation"); }
  else if (s === "concept") score += 6;

  let completeness = 0;
  if (i.phone) completeness += 5;
  if (i.location) completeness += 5;
  if ((i.notes ?? "").length > 40) { completeness += 5; reasons.push("Wrote a detailed brief"); }
  if (i.moods && i.moods.length) completeness += 5;
  if (i.booked) { completeness += 10; reasons.push("Booked a consultation"); }
  score += Math.min(completeness, 25);

  score = Math.min(100, score);
  const tier = score >= 70 ? "Priority" : score >= 45 ? "Qualified" : "Nurture";
  const nextAction =
    tier === "Priority"
      ? "Director to call within 2 business hours"
      : tier === "Qualified"
        ? "Studio manager to reply within 1 business day"
        : "Send the studio lookbook and nurture by email";
  return { score, tier, reasons, nextAction };
}
