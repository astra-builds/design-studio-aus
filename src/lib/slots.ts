// Consultation availability — generated in Australia/Sydney time.
const TZ = "Australia/Sydney";
const TIMES = ["09:30", "11:00", "13:00", "14:30", "16:00"];

function tzOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+10:00";
  const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 600;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] ?? "0", 10));
}

function sydneyToUtc(y: number, mo: number, d: number, hh: number, mm: number): Date {
  const guess = Date.UTC(y, mo - 1, d, hh, mm);
  let off = tzOffsetMinutes(new Date(guess));
  let t = guess - off * 60000;
  off = tzOffsetMinutes(new Date(t));
  t = guess - off * 60000;
  return new Date(t);
}

function sydneyParts(date: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const get = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  return {
    y: parseInt(get("year"), 10),
    m: parseInt(get("month"), 10),
    d: parseInt(get("day"), 10),
    wd: get("weekday"),
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type Slot = { iso: string; time: string; available: boolean };
export type SlotDay = { date: string; label: string; weekday: string; day: number; month: string; slots: Slot[] };

export function generateDays(taken: Set<string>, numDays = 14): SlotDay[] {
  const now = new Date();
  const out: SlotDay[] = [];
  const earliest = now.getTime() + 24 * 3600 * 1000; // 24h notice
  let cursor = new Date(now.getTime());
  let guard = 0;
  while (out.length < numDays && guard < 40) {
    guard++;
    cursor = new Date(cursor.getTime() + (guard === 1 ? 0 : 24 * 3600 * 1000));
    const p = sydneyParts(cursor);
    if (p.wd === "Sat" || p.wd === "Sun") continue;
    const dateStr = `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
    const slots: Slot[] = TIMES.map((time) => {
      const [hh, mm] = time.split(":").map(Number);
      const dt = sydneyToUtc(p.y, p.m, p.d, hh, mm);
      const iso = dt.toISOString();
      const busy = hash(dateStr + time) % 100 < 38; // deterministic "diary" feel
      const available = dt.getTime() > earliest && !busy && !taken.has(iso);
      return { iso, time, available };
    });
    const noon = sydneyToUtc(p.y, p.m, p.d, 12, 0);
    out.push({
      date: dateStr,
      label: new Intl.DateTimeFormat("en-AU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(noon),
      weekday: new Intl.DateTimeFormat("en-AU", { timeZone: TZ, weekday: "short" }).format(noon),
      day: p.d,
      month: new Intl.DateTimeFormat("en-AU", { timeZone: TZ, month: "short" }).format(noon),
      slots,
    });
  }
  return out;
}

export function isValidSlot(iso: string): boolean {
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return false;
  const p = sydneyParts(dt);
  const dateStr = `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(dt);
  return TIMES.includes(time) && p.wd !== "Sat" && p.wd !== "Sun" && dt.getTime() > Date.now() && !!dateStr;
}

export function formatSlot(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso)) + " (Sydney time)";
}
