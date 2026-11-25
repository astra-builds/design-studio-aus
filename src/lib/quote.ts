export type Kind = "home" | "renovation" | "apartment" | "coastal" | "hospitality" | "commercial";
export type Scope = "concept" | "documentation" | "full";
export type Level = "considered" | "refined" | "exceptional";

export type QuoteInput = {
  kind: Kind;
  sqm: number;
  scope: Scope;
  level: Level;
  state?: string;
};

export type QuoteResult = {
  lowBudget: number;
  highBudget: number;
  lowFee: number;
  highFee: number;
  designWeeks: [number, number];
  deliveryMonths: [number, number];
  belowMinimum: boolean;
  notes: string[];
};

const BASE: Record<Level, number> = { considered: 2800, refined: 4200, exceptional: 6500 };
const KIND: Record<Kind, number> = {
  home: 1,
  renovation: 1.25,
  apartment: 1.05,
  coastal: 1.1,
  hospitality: 1.35,
  commercial: 0.95,
};
const STATE: Record<string, number> = {
  NSW: 1, VIC: 1, QLD: 0.97, WA: 0.98, SA: 0.93, TAS: 1.02, ACT: 1, NT: 1.08,
};

function round(n: number, step: number) {
  return Math.round(n / step) * step;
}

export function estimate(input: QuoteInput): QuoteResult {
  const sqm = Math.max(20, Math.min(2000, input.sqm || 0));
  const region = STATE[(input.state ?? "NSW").toUpperCase()] ?? 1;
  const mid = sqm * BASE[input.level] * KIND[input.kind] * region;
  const lowBudget = round(mid * 0.85, 10000);
  const highBudget = round(mid * 1.2, 10000);

  let lowFee: number;
  let highFee: number;
  if (input.scope === "concept") {
    const m = 3500 + sqm * 55;
    lowFee = Math.max(4500, round(m * 0.9, 500));
    highFee = Math.max(6500, round(m * 1.2, 500));
  } else if (input.scope === "documentation") {
    lowFee = Math.max(9500, round(mid * 0.07, 500));
    highFee = Math.max(13500, round(mid * 0.095, 500));
  } else {
    lowFee = Math.max(16000, round(mid * 0.11, 500));
    highFee = Math.max(22000, round(mid * 0.15, 500));
  }

  const f = input.level === "exceptional" ? 1.25 : input.level === "refined" ? 1.1 : 1;
  const designWeeks: [number, number] =
    input.scope === "concept"
      ? [4, 6]
      : input.scope === "documentation"
        ? [10, 14]
        : [12, 18];
  const base = 4 + sqm / 70;
  const deliveryMonths: [number, number] = [
    Math.max(3, Math.round(base * f)),
    Math.max(5, Math.round(base * f * 1.5)),
  ];

  const notes: string[] = [];
  const belowMinimum = highBudget < 80000;
  if (belowMinimum)
    notes.push("This is below our usual project size — a Design Hour or Styling Day may suit you better.");
  if (input.kind === "renovation")
    notes.push("Renovations carry more unknowns — we hold a 10–15% contingency on top of this range.");
  if (input.kind === "hospitality")
    notes.push("Hospitality figures exclude kitchen equipment and compliance works.");
  notes.push("Excludes structural works, GST, and builder margins unless agreed.");

  return { lowBudget, highBudget, lowFee, highFee, designWeeks, deliveryMonths, belowMinimum, notes };
}

export function aud(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function audShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/0$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}
