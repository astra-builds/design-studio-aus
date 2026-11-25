import { db } from "@/db";
import { bookings } from "@/db/schema";
import { generateDays } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  let taken = new Set<string>();
  try {
    const rows = await db.select({ s: bookings.slotStart }).from(bookings);
    taken = new Set(rows.map((r) => r.s.toISOString()));
  } catch {
    // fall through with no taken slots
  }
  return Response.json({ days: generateDays(taken, 14) });
}
