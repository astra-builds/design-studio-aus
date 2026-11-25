import { demoListBookings } from "@/lib/demo-store";
import { generateDays } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  let taken = new Set<string>();
  try {
    taken = new Set(demoListBookings().map((r) => r.slotStart.toISOString()));
  } catch {
    // fall through with no taken slots
  }
  return Response.json({ days: generateDays(taken, 14) });
}
