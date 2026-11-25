import { db } from "@/db";
import { bookings, enquiries, outbox, conversations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function authorised(req: Request) {
  const key = process.env.ADMIN_PASSCODE ?? "halden-desk";
  return req.headers.get("x-admin-key") === key;
}

export async function GET(req: Request) {
  if (!authorised(req)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(100);
  const bks = await db.select().from(bookings);
  const msgs = await db.select().from(outbox).orderBy(desc(outbox.createdAt)).limit(300);
  const convos = await db.select().from(conversations);
  const data = rows.map((e) => ({
    ...e,
    booking: bks.find((b) => b.enquiryId === e.id) ?? null,
    messages: msgs.filter((m) => m.enquiryId === e.id),
    transcript: convos.find((c) => c.enquiryId === e.id)?.transcript ?? null,
  }));
  return Response.json({ enquiries: data });
}

export async function PATCH(req: Request) {
  if (!authorised(req)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { id, status } = (await req.json()) as { id: number; status: string };
  const allowed = ["new", "contacted", "consult", "proposal", "won", "archived"];
  if (!allowed.includes(status)) return Response.json({ error: "Bad status" }, { status: 400 });
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  return Response.json({ ok: true });
}
