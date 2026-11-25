import { demoSaveConversation } from "@/lib/demo-store";
import { respond, KB_SUMMARY, type Lead, type Msg } from "@/lib/concierge";
import { queueMessages, upsertEnquiry } from "@/lib/leads";
import { qualify } from "@/lib/qualify";

export const dynamic = "force-dynamic";

type Body = { sessionId?: string; messages?: Msg[]; lead?: Lead };

async function llmFallback(messages: Msg[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 220,
        messages: [{ role: "system", content: KB_SUMMARY }, ...messages.slice(-8)],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const messages = (body.messages ?? []).slice(-20).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content ?? "").slice(0, 1200),
  }));
  if (!messages.length) return Response.json({ error: "No message" }, { status: 400 });

  const leadIn: Lead = body.lead ?? {};
  const out = respond(messages, leadIn);

  if (out.reply.startsWith("I want to give you a precise answer")) {
    const ai = await llmFallback(messages);
    if (ai) out.reply = ai;
  }

  const lead = out.lead;
  const shouldSave = !!lead.email && (!!lead.projectType || !!lead.location);
  const transcript = [...messages, { role: "assistant", content: out.reply }];

  try {
    if (shouldSave) {
      const notes = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" | ")
        .slice(0, 900);
      const { enquiry, qualification, created } = await upsertEnquiry(
        {
          source: "concierge",
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          projectType: lead.projectType,
          location: lead.location,
          budgetLabel: lead.budgetLabel,
          budgetValue: lead.budgetValue,
          timeline: lead.timeline,
          notes,
        },
        lead.id,
      );
      lead.id = enquiry.id;
      lead.ref = enquiry.ref;
      if (created || !lead.saved) {
        const q = qualify({ ...enquiry });
        await queueMessages({ enquiry, tier: qualification.tier, nextAction: q.nextAction });
      }
      lead.saved = true;
    }
    if (body.sessionId) {
      demoSaveConversation({ sessionId: body.sessionId, enquiryId: lead.id ?? null, transcript });
    }
  } catch (err) {
    console.error("concierge persistence failed", err);
  }

  return Response.json({ reply: out.reply, chips: out.chips, actions: out.actions, lead });
}
