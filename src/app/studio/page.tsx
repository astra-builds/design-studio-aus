import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Lines, Reveal } from "@/components/Reveal";
import { ParallaxImg } from "@/components/Parallax";
import { IMG } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio",
  description: "Meet Halden Rowe — a Sydney interior architecture and design studio founded in 2012.",
};

const principles = [
  ["Light before furniture", "We start by studying where the sun falls at 7 am, noon and dusk. Everything else is arranged around it."],
  ["Honest, local material", "Australian timber, stone and clay wherever we can. Materials that age with dignity, not ones that hide."],
  ["Fewer, better things", "A room is finished when there is nothing left to remove. We edit relentlessly — and then we edit again."],
  ["Designed for Tuesday", "Beautiful on the day of the photoshoot is easy. We design for the ordinary Tuesday night."],
];

const team = [
  ["Imogen Halden", "Co-founder & Design Director", "Trained in architecture, obsessed with plaster."],
  ["Tom Rowe", "Co-founder & Creative Director", "Joinery, furniture and a quietly strong opinion about brass."],
  ["Priya Nandakumar", "Senior Designer, Residential", "Leads our family homes and renovations."],
  ["Lachlan Burke", "Senior Designer, Hospitality", "Restaurants, bars and the occasional hotel."],
  ["Mei Tanaka", "Materials & Procurement", "Keeper of the 600-sample library."],
  ["Sasha Ortiz", "Studio Manager", "Keeps everyone on time. Replies to your WhatsApp."],
];

const faqs = [
  ["What does a first consultation involve?", "A complimentary 45-minute conversation — in our Paddington studio, at your site, or by video. We listen, look at your plans, and tell you honestly whether and how we can help. There's no obligation."],
  ["What size projects do you take on?", "Most of our residential work has interior budgets from $250k, though we take on exceptional smaller projects from about $80k. For a single room or a refresh, a Design Hour or Styling Day is a lovely start."],
  ["How are your fees structured?", "Concept-only engagements start at $4,500. Design and documentation is typically 8–10% of the interior budget; full-service through installation is 12–15%. We provide a written proposal after the first meeting."],
  ["Do you work outside Sydney?", "Yes — across NSW, Victoria, Queensland and Tasmania, and by video elsewhere. A site visit travel fee applies beyond the greater Sydney area."],
  ["Can you work with my architect and builder?", "Always. Most of our best projects are collaborations. We join early, coordinate drawings, and stay with the team through construction."],
  ["How soon can you start?", "We schedule new projects about ten weeks out. If your timeline is tight, tell us — we occasionally have room for the right project."],
];

export default function StudioPage() {
  return (
    <main>
      <section data-theme="light" className="px-6 pb-24 pt-44 md:px-10 md:pt-56">
        <div className="mx-auto max-w-[1500px]">
          <p className="eyebrow mb-6 text-ink/50">The studio — since 2012</p>
          <Lines lines={["A small studio", "with a long", <em key="e" className="font-light text-clay">attention span.</em>]} className="display text-[clamp(3.4rem,9.4vw,10rem)]" />
        </div>
      </section>

      <section data-theme="light" className="px-6 pb-32 md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-14 md:grid-cols-12">
          <Reveal variant="image" className="md:col-span-8">
            <ParallaxImg src={IMG.studio} position="50% 50%" className="aspect-[16/10] w-full" speed={0.07} />
            <p className="eyebrow mt-4 text-ink/50">The Paddington studio, 3 pm</p>
          </Reveal>
          <div className="md:col-span-4 md:pt-24">
            <Reveal>
              <p className="display text-3xl leading-tight md:text-4xl">
                Imogen Halden and Tom Rowe started the practice at a kitchen table in 2012, with one rule: <em>no project we wouldn&rsquo;t live in ourselves.</em>
              </p>
              <p className="mt-8 leading-[1.8] text-ink/65">
                Today we are a team of eleven — designers, an architect, a materials librarian and a studio manager who answers your messages faster than anyone. We take on a handful of projects each year, so each gets a lead designer who stays from first conversation to final cushion.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section data-theme="dark" className="bg-ink px-6 py-28 text-bone md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="eyebrow mb-16 text-bone/50">What we believe</p>
          <div className="grid gap-x-16 gap-y-16 md:grid-cols-2">
            {principles.map(([t, d], i) => (
              <Reveal key={t} delay={(i % 2) * 0.1} className="border-t border-bone/20 pt-8">
                <div className="flex gap-8">
                  <span className="display text-5xl italic text-ochre">0{i + 1}</span>
                  <div>
                    <h3 className="display text-4xl md:text-5xl">{t}</h3>
                    <p className="mt-5 max-w-md leading-relaxed text-bone/65">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-16 flex items-end justify-between">
            <Lines lines={["The people"]} className="display text-[clamp(3rem,7vw,7rem)]" />
            <p className="eyebrow hidden text-ink/50 md:block">Eleven in the studio</p>
          </div>
          <ul>
            {team.map(([n, r, b], i) => (
              <Reveal key={n} delay={0.03 * i}>
                <li className="group grid items-baseline gap-2 border-t border-ink/15 py-7 transition-colors last:border-b md:grid-cols-12 md:gap-8">
                  <span className="display text-3xl italic transition-transform duration-700 group-hover:translate-x-3 md:col-span-5 md:text-5xl">{n}</span>
                  <span className="eyebrow text-clay md:col-span-3">{r}</span>
                  <span className="text-ink/60 md:col-span-4">{b}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section data-theme="light" className="bg-plaster px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow mb-6 text-ink/50">Good questions</p>
            <Lines lines={["Before", <em key="e" className="font-light">we meet.</em>]} className="display text-[clamp(3rem,6vw,6rem)]" />
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {faqs.map(([q, a]) => (
              <details key={q} className="group border-t border-ink/20 py-6 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className="display text-2xl md:text-3xl">{q}</span>
                  <span className="relative block h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-1/2 h-px w-full bg-ink" />
                    <span className="absolute left-1/2 top-0 h-full w-px bg-ink transition-transform duration-500 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="mt-5 max-w-xl leading-[1.75] text-ink/65">{a}</p>
              </details>
            ))}
            <div className="mt-12">
              <Link href="/begin" className="btn btn-solid">
                Begin a project
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
