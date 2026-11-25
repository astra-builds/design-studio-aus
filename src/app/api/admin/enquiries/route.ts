import { demoListBookings, demoListConversations, demoListEnquiries, demoListMessages, demoUpdateEnquiry } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

function authorised(req: Request) {
  const key = process.env.ADMIN_PASSCODE ?? "halden-desk";
  return req.headers.get("x-admin-key") === key;
}

export async function GET(req: Request) {
  if (!authorised(req)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const rows = demoListEnquiries();
  const bks = demoListBookings();
  const msgs = demoListMessages();
  const convos = demoListConversations();
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
  demoUpdateEnquiry(id, { status: status as typeof allowed[number] });
  return Response.json({ ok: true });
}
