import { STUDIO, projects } from "@/lib/studio";
import { generateDays, formatSlot } from "@/lib/slots";

export type Lead = {
  id?: number;
  ref?: string;
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  location?: string;
  budgetLabel?: string;
  budgetValue?: number;
  timeline?: string;
  asking?: "projectType" | "location" | "budget" | "timeline" | "email" | "name" | null;
  saved?: boolean;
};

export type Msg = { role: "user" | "assistant"; content: string };

export type Action = { label: string; href: string; external?: boolean };

const PLACES = [
  "bondi", "bronte", "paddington", "sydney", "melbourne", "brisbane", "byron", "noosa", "hobart", "perth", "adelaide",
  "canberra", "mornington", "gold coast", "newcastle", "southern highlands", "blue mountains", "fitzroy", "toorak",
  "manly", "mosman", "balmain", "surry hills", "potts point", "palm beach", "kangaroo valley", "daylesford", "sunshine coast",
  "geelong", "brighton", "st kilda", "richmond", "woollahra", "double bay", "newtown", "coogee", "avalon", "cairns",
];

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function extractProjectType(t: string): string | undefined {
  if (/restaurant|cafe|café|bar\b|hotel|venue|hospitality|pub\b|bistro/.test(t)) return "Hospitality";
  if (/office|workplace|retail|shop|store|showroom|boutique|clinic/.test(t)) return "Commercial / retail";
  if (/apartment|unit\b|flat\b|penthouse|townhouse/.test(t)) return "Apartment";
  if (/holiday|beach house|weekender|coastal|retreat|farm/.test(t)) return "Coastal / holiday home";
  if (/kitchen|bathroom|ensuite|laundry/.test(t)) return "Kitchen / bathroom";
  if (/renovat|reno\b|extension|refurb|remodel|update/.test(t)) return "Renovation";
  if (/new build|building a|build a|new home|new house|knockdown|rebuild|house|home/.test(t)) return "New home";
  return undefined;
}

function extractLocation(raw: string, asking: boolean): string | undefined {
  const t = raw.toLowerCase();
  for (const p of PLACES) if (t.includes(p)) return cap(p);
  const m = raw.match(/\bin\s+([A-Z][a-zA-Z' -]{2,30})/);
  if (m) return m[1].trim();
  if (asking && raw.length < 40 && !/[@\d$]/.test(raw)) return cap(raw.trim().replace(/[.!]+$/, ""));
  return undefined;
}

function extractBudget(raw: string, asking: boolean): { label: string; value: number } | undefined {
  const t = raw.toLowerCase().replace(/,/g, "");
  const m = t.match(/\$?\s?(\d+(?:\.\d+)?)\s?(k|m|mil|million|thousand)?\b/);
  const hasMoneyCue = /\$|\bk\b|\d\s?k\b|million|budget|\bm\b/.test(t);
  if (m && (hasMoneyCue || asking)) {
    let v = parseFloat(m[1]);
    const u = m[2];
    if (u === "k" || u === "thousand") v *= 1000;
    else if (u === "m" || u === "mil" || u === "million") v *= 1_000_000;
    else if (v < 1000 && !u) v = v < 20 ? v * 100_000 : v * 1000; // "5" -> unclear; "300" -> 300k
    if (v >= 5000) {
      const fmt = v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : `$${Math.round(v / 1000)}k`;
      return { label: fmt, value: Math.round(v) };
    }
  }
  if (asking && /not sure|no idea|flexible|unsure|depends|open/.test(t)) return { label: "To be discussed", value: 0 };
  return undefined;
}

function extractTimeline(raw: string, asking: boolean): string | undefined {
  const t = raw.toLowerCase();
  if (/asap|right away|immediately|this month|straight away|urgent|next month|as soon as/.test(t)) return "ASAP";
  const m = t.match(/(\d+)\s*(?:-|–|—|to)?\s*(\d+)?\s*months?/);
  if (m) {
    const n = parseInt(m[2] ?? m[1], 10);
    return n <= 3 ? "Within 3 months" : n <= 6 ? "3–6 months" : "6–12 months";
  }
  if (/few months|couple of months|this year|by (?:summer|winter|christmas)/.test(t)) return "3–6 months";
  if (/next year|12 months|a year|later/.test(t)) return "6–12 months";
  if (/exploring|just looking|no rush|dreaming|early|researching|browsing/.test(t)) return "Exploring";
  if (asking && raw.length < 40) return raw.trim();
  return undefined;
}

export function extractFields(text: string, lead: Lead): Lead {
  const next: Lead = { ...lead };
  const t = text.toLowerCase();
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) next.email = email[0];
  const phone = text.match(/(?:\+?61|0)[\s-]?4\d{2}[\s-]?\d{3}[\s-]?\d{3}|(?:\+?61|0)[\s-]?[2378][\s-]?\d{4}[\s-]?\d{4}/);
  if (phone) next.phone = phone[0].replace(/\s+/g, " ");
  const nm = text.match(/(?:i'm|i am|my name is|this is|name's|it's|im)\s+([A-Za-z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
  if (nm && !/looking|planning|thinking|after|wondering|interested|building|renovating/i.test(nm[1])) next.name = cap(nm[1].toLowerCase());
  else if (lead.asking === "name" && !email && text.trim().split(/\s+/).length <= 3 && !/\d/.test(text)) next.name = cap(text.trim().replace(/[.!]+$/, ""));

  const pt = extractProjectType(t);
  if (pt && (!next.projectType || lead.asking === "projectType")) next.projectType = pt;
  const loc = extractLocation(text, lead.asking === "location");
  if (loc && (!next.location || lead.asking === "location")) next.location = loc;
  const b = extractBudget(text, lead.asking === "budget");
  if (b && (!next.budgetLabel || lead.asking === "budget")) {
    next.budgetLabel = b.label;
    next.budgetValue = b.value;
  }
  const tl = extractTimeline(text, lead.asking === "timeline");
  if (tl && (!next.timeline || lead.asking === "timeline")) next.timeline = tl;
  return next;
}

function nextMissing(l: Lead): Lead["asking"] {
  if (!l.projectType) return "projectType";
  if (!l.location) return "location";
  if (!l.budgetLabel) return "budget";
  if (!l.timeline) return "timeline";
  if (!l.email) return "email";
  if (!l.name) return "name";
  return null;
}

const QUESTIONS: Record<NonNullable<Lead["asking"]>, string> = {
  projectType: "What kind of space are we talking about — a new home, a renovation, an apartment, or something commercial?",
  location: "Where is the project? A suburb or town is perfect.",
  budget: "Do you have a rough interior budget in mind? A ballpark is fine — it simply helps us suggest the right approach.",
  timeline: "And when would you ideally like to begin?",
  email: "What's the best email for us to send a note to? (If you'd rather WhatsApp, include your mobile too.)",
  name: "Lovely — and who am I speaking with?",
};

const CHIPS: Record<NonNullable<Lead["asking"]>, string[]> = {
  projectType: ["New home", "Renovation", "Apartment", "Restaurant or venue"],
  location: ["Sydney", "Melbourne", "Byron Bay", "Elsewhere in Australia"],
  budget: ["Under $150k", "$150k–$400k", "$400k+", "Not sure yet"],
  timeline: ["ASAP", "In 3–6 months", "Next year", "Just exploring"],
  email: [],
  name: [],
};

function nextAvailability(): string {
  const days = generateDays(new Set(), 10);
  const out: string[] = [];
  for (const d of days) {
    for (const s of d.slots) {
      if (s.available && out.length < 3) out.push(formatSlot(s.iso).replace(" (Sydney time)", ""));
    }
  }
  return out.join("; ");
}

function startMonth(): string {
  const d = new Date(Date.now() + 10 * 7 * 24 * 3600 * 1000);
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(d);
}

type Intent =
  | "greeting" | "pricing" | "process" | "timeline" | "services" | "location" | "booking" | "contact"
  | "prepare" | "portfolio" | "hospitality" | "styling" | "materials" | "human" | "thanks" | "project" | "style" | "small";

function detectIntent(t: string): Intent | null {
  if (/^(hi|hello|hey|g'?day|good (morning|afternoon|evening))\b/.test(t) && t.length < 30) return "greeting";
  if (/thank|cheers|appreciate/.test(t) && t.length < 60) return "thanks";
  if (/speak to|talk to|human|real person|call me|phone|ring|someone|designer please/.test(t)) return "human";
  if (/whatsapp|email address|contact|address|where are you|studio location|visit the studio/.test(t) && !/budget/.test(t)) return "contact";
  if (/bring|prepare|before we meet|what do i need/.test(t)) return "prepare";
  if (/book|appointment|consult|meeting|availab|schedule|catch up|call\b|choose a time|pick a time|a time\b/.test(t)) return "booking";
  if (/price|pricing|cost|fee|how much|quote|estimate|rate|charge|afford|expensive/.test(t)) return "pricing";
  if (/how long|timeline|how soon|when can|start|lead time|duration|waitlist|wait list/.test(t)) return "timeline";
  if (/process|how (does|do) (it|you)|what happens|steps|work with you/.test(t)) return "process";
  if (/restaurant|cafe|café|hotel|bar\b|venue|hospitality|retail|office|commercial/.test(t)) return "hospitality";
  if (/styling|stylist|decorat|furnish|one.?off|just (the )?furniture|edit/.test(t)) return "styling";
  if (/material|timber|stone|travertine|sustainab|eco|local|brass|linen|plaster/.test(t)) return "materials";
  if (/style|aesthetic|inspiration|what would you|recommend|suggest|ideas|palette|colour|color/.test(t)) return "style";
  if (/small|studio flat|one room|single room|just a (room|bathroom|kitchen)|tiny|minimum/.test(t)) return "small";
  if (/service|what do you do|what you do|offer/.test(t)) return "services";
  if (/areas?|interstate|travel|do you (work|design|service)|melbourne|brisbane|perth|hobart|regional|remote|overseas/.test(t)) return "location";
  if (/portfolio|work\b|projects|previous|examples|show me|gallery/.test(t)) return "portfolio";
  if (/renovat|build|extension|new home|apartment|designing|my (house|home|place|space|kitchen|bathroom)|i have a|we have a|looking for (a )?designer|planning|project/.test(t)) return "project";
  return null;
}

export type Reply = { reply: string; chips: string[]; actions: Action[]; lead: Lead };

export function respond(messages: Msg[], leadIn: Lead): Reply {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const t = last.toLowerCase().trim();
  const lead = extractFields(last, leadIn);
  const rawIntent = detectIntent(t);
  const actions: Action[] = [];
  let chips: string[] = [];
  const parts: string[] = [];
  let resumeQuestion = true;

  const gotNewFields =
    (lead.projectType && lead.projectType !== leadIn.projectType) ||
    (lead.location && lead.location !== leadIn.location) ||
    (lead.budgetLabel && lead.budgetLabel !== leadIn.budgetLabel) ||
    (lead.timeline && lead.timeline !== leadIn.timeline) ||
    (lead.email && lead.email !== leadIn.email) ||
    (lead.name && lead.name !== leadIn.name);

  const answering = leadIn.asking && gotNewFields;
  const intent: Intent | null =
    answering &&
    ((leadIn.asking === "location" && rawIntent === "location") ||
      (leadIn.asking === "timeline" && (rawIntent === "timeline" || rawIntent === "booking")) ||
      (leadIn.asking === "budget" && rawIntent === "pricing") ||
      (leadIn.asking === "email" && rawIntent === "contact"))
      ? null
      : rawIntent;

  switch (intent) {
    case "greeting":
      parts.push(
        `G'day — I'm the concierge at ${STUDIO.name}. I can tell you about our process, fees and availability, or help you set up a consultation with a designer.`,
      );
      chips = ["What does it cost?", "How does it work?", "Book a consultation", "See your work"];
      resumeQuestion = false;
      break;
    case "thanks":
      parts.push("Any time. If anything else comes to mind — a material, a budget, a nagging corner of your home — just ask.");
      chips = ["Book a consultation", "Get an estimate"];
      resumeQuestion = false;
      break;
    case "pricing":
      parts.push(
        "Honestly, it depends on size and scope — but as a guide: a concept-only engagement starts at $4,500; design and documentation is typically 8–10% of your interior budget; and full-service (through to installation) is 12–15%. Most of our residential projects have interior budgets from $250k.",
        "If you tell me the size and style of your space, the estimate tool gives you a live range in about a minute.",
      );
      actions.push({ label: "Get a live estimate", href: "/begin?step=space" });
      chips = ["Book a consultation", "How long does it take?"];
      break;
    case "process":
      parts.push(
        "Four phases: Listen (site walk and a long conversation), Imagine (concept with real samples), Resolve (full documentation and tendering), and Deliver (we're on site until the last cushion). Every project has one lead designer from first coffee to handover.",
      );
      chips = ["How long does it take?", "What does it cost?", "Book a consultation"];
      break;
    case "timeline":
      parts.push(
        `A concept takes 4–6 weeks; full documentation another 6–8. Construction depends on scale — typically 5–14 months for a whole home. We're currently scheduling new projects from ${startMonth()}.`,
      );
      chips = ["Book a consultation", "What does it cost?"];
      break;
    case "services":
      parts.push(
        "We design residential interiors, renovations and spatial planning, hospitality and retail, bespoke joinery and furniture, and offer procurement & styling days for finishing a space.",
      );
      actions.push({ label: "Explore services", href: "/#services" });
      chips = ["Hospitality projects", "Styling only", "What does it cost?"];
      break;
    case "location":
      parts.push(
        "Our studio is in Paddington, Sydney, and we design across NSW, Victoria, Queensland and Tasmania — with consultations by video for everywhere else. We travel for site visits and regularly work in Byron, the Peninsula and the Southern Highlands.",
      );
      chips = ["Book a video call", "What does it cost?"];
      break;
    case "booking":
      parts.push(
        `We'd love to meet. A first consultation is complimentary, 45 minutes, and can be in the studio, on site or by video. Our next openings: ${nextAvailability()}.`,
      );
      actions.push({ label: "Choose a time", href: "/begin?step=book" });
      chips = ["Get an estimate first", "What should I bring?"];
      break;
    case "prepare":
      parts.push(
        "Bring a few images you love, any plans or drawings, and a short list of what isn't working in your home today. If you have none of that, don't worry — the first meeting is simply a conversation.",
      );
      chips = ["Choose a time", "What does it cost?"];
      break;
    case "contact":
      parts.push(
        `You can reach us on WhatsApp (+${STUDIO.whatsapp}), at ${STUDIO.email}, or on ${STUDIO.phone}. The studio is at ${STUDIO.address.join(", ")} — visits by appointment.`,
      );
      actions.push({ label: "Open WhatsApp", href: `https://wa.me/${STUDIO.whatsapp}`, external: true });
      actions.push({ label: "Email the studio", href: `mailto:${STUDIO.email}`, external: true });
      resumeQuestion = false;
      break;
    case "portfolio": {
      const names = projects.slice(0, 4).map((p) => p.title).join(", ");
      parts.push(`A few favourites: ${names}. Each has a story behind it — the work page shows them in full.`);
      actions.push({ label: "View our work", href: "/work" });
      chips = ["Plan my project", "Book a consultation"];
      break;
    }
    case "hospitality":
      parts.push(
        "Yes — hospitality and retail are about a third of our work (Ember in Fitzroy is a recent favourite). We handle concept, joinery, lighting and furniture, and coordinate with your builder and chef. Design fees from $16,000.",
      );
      chips = ["Plan my venue", "Book a consultation"];
      break;
    case "styling":
      parts.push(
        "We do — a Styling Day (from $1,800) is a curated edit of furniture, art, lighting and textiles for a space that's nearly there. We source, deliver and place everything.",
      );
      chips = ["Book a styling day", "What does it cost?"];
      break;
    case "materials":
      parts.push(
        "We favour honest, locally sourced materials: NSW spotted gum and blackbutt from certified forests, Australian limestone and bluestone, hand-trowelled plasters and natural linens. Our materials library in Paddington is open to clients.",
      );
      actions.push({ label: "Explore materials", href: "/#materials" });
      break;
    case "style":
      parts.push(
        "The fastest way is to show us. Pick a few images that feel like home, and we'll sketch a direction — materials, palette, and a project that's close to it. It takes a minute.",
      );
      actions.push({ label: "Find your direction", href: "/begin?step=mood" });
      break;
    case "small":
      parts.push(
        "We prefer projects with interior budgets above about $80k, but for a single room or a quick refresh a Design Hour ($350) or Styling Day (from $1,800) is a lovely way to start.",
      );
      chips = ["Book a Design Hour", "Get an estimate"];
      break;
    case "human":
      parts.push(
        `Of course. You can WhatsApp the studio directly — a designer replies during business hours (Mon–Fri, 9–5 Sydney time) — or leave your mobile here and we'll call you.`,
      );
      actions.push({ label: "Open WhatsApp", href: `https://wa.me/${STUDIO.whatsapp}`, external: true });
      lead.asking = "email";
      break;
    case "project":
      if (!answering) parts.push("That sounds like a lovely project. A few quick questions will help me point you in the right direction.");
      break;
    default:
      break;
  }

  if (answering && intent !== "project") {
    // acknowledge slot filling
    parts.unshift(pickAck(lead, leadIn));
  } else if (answering) {
    parts.unshift(pickAck(lead, leadIn));
  }

  // Lead is "in progress" if they've shared anything or expressed project intent
  const inProgress = !!(intent === "project" || answering || lead.projectType || lead.location || lead.email);
  const missing = nextMissing(lead);

  if (!intent && !answering) {
    // fallback
    if (inProgress && missing) {
      parts.push("Thank you — that helps.");
    } else {
      parts.push(
        "I want to give you a precise answer on that, so I'll hand it to a designer. Meanwhile I can help with fees, timelines, our process, or setting up a consultation.",
      );
      chips = ["What does it cost?", "Book a consultation", "Talk to a person"];
      resumeQuestion = missing === "email";
    }
  }

  let saveNow = false;
  if (lead.email && !lead.saved && (lead.projectType || lead.location)) {
    saveNow = true;
  }

  if (saveNow) {
    parts.push(
      `Thank you${lead.name ? `, ${lead.name.split(" ")[0]}` : ""} — I've passed your details to the studio. A designer will reply within one business day${
        lead.budgetValue && lead.budgetValue >= 250000 ? " (usually much sooner for projects like yours)" : ""
      }. You'll also get a confirmation email.`,
      "The quickest way to move things forward is to choose a time for a complimentary first consultation.",
    );
    actions.push({ label: "Choose a time", href: "/begin?step=book" });
    chips = ["What should I bring?", "How does it work?"];
    lead.asking = null;
  } else if (resumeQuestion && inProgress && missing && !lead.saved) {
    const q = QUESTIONS[missing];
    parts.push(q);
    lead.asking = missing;
    if (CHIPS[missing].length) chips = CHIPS[missing];
  } else if (!inProgress) {
    lead.asking = leadIn.asking && !intent ? leadIn.asking : null;
  }

  if (lead.saved && !saveNow && !intent && !answering) {
    parts.push("Noted — I've added that to your enquiry.");
  }

  return { reply: parts.join("\n\n"), chips, actions, lead };
}

function pickAck(l: Lead, prev: Lead): string {
  if (l.projectType && l.projectType !== prev.projectType) return `${l.projectType} — wonderful.`;
  if (l.location && l.location !== prev.location) return `${l.location} — a beautiful part of the world to design in.`;
  if (l.budgetLabel && l.budgetLabel !== prev.budgetLabel) return l.budgetValue ? `Thank you — ${l.budgetLabel} gives us a lot to work with.` : "No problem — we'll work that out together.";
  if (l.timeline && l.timeline !== prev.timeline) return `Got it — ${l.timeline.toLowerCase()}.`;
  if (l.name && l.name !== prev.name) return `Lovely to meet you, ${l.name.split(" ")[0]}.`;
  return "Thank you.";
}

export const KB_SUMMARY = `You are the concierge for ${STUDIO.name}, an Australian interior architecture and design studio in Paddington, Sydney.
Voice: warm, calm, concise, Australian spelling, never salesy. Never invent prices beyond these facts:
- Concept-only from $4,500; design+documentation ~8–10% of interior budget; full service 12–15%.
- Design Hour $350; Styling Day from $1,800; typical residential interior budgets from $250k; minimum ~$80k.
- First consultation is complimentary (45 min): studio, site or video. Studio: ${STUDIO.address.join(", ")}.
- Work in NSW, VIC, QLD, TAS; video consults elsewhere. Next availability around ${startMonth()}.
- Contact: WhatsApp +${STUDIO.whatsapp}, ${STUDIO.email}, ${STUDIO.phone}.
Keep replies under 90 words. Encourage booking a consultation at /begin when appropriate.`;
