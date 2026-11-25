import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Lines, Reveal } from "@/components/Reveal";
import { ParallaxImg } from "@/components/Parallax";
import { directions, projects } from "@/lib/studio";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.title}, ${p.place}`,
    description: p.blurb,
    openGraph: { images: [p.cover] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = projects.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const p = projects[idx];
  const next = projects[(idx + 1) % projects.length];
  const dir = directions[p.direction];
  const kind =
    p.type === "Hospitality" ? "hospitality" : p.type === "Apartment" ? "apartment" : p.type === "Retreat" ? "coastal" : "home";

  return (
    <main>
      {/* Hero */}
      <section data-theme="dark" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink">
        <div className="kenburns absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.cover} alt={p.title} className="h-full w-full object-cover" style={{ objectPosition: p.position }} fetchPriority="high" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
        <div className="absolute inset-x-6 bottom-10 text-bone md:inset-x-10 md:bottom-14">
          <p className="hero-fade eyebrow mb-6 text-bone/75" style={{ ["--i" as string]: 0 }}>
            {p.type} — {p.place}, {p.state} — {p.year}
          </p>
          <h1 className="display text-[clamp(4.5rem,16vw,17rem)] italic leading-[0.82]">
            <span className="line hero-line" style={{ ["--i" as string]: 0 }}>
              <span>{p.title}</span>
            </span>
          </h1>
        </div>
      </section>

      {/* Meta + story */}
      <section data-theme="light" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-12">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-3 md:block md:space-y-9">
            {[
              ["Location", `${p.place}, ${p.state}`],
              ["Year", String(p.year)],
              ["Area", `${p.area} m²`],
              ["Type", p.type],
            ].map(([k, v], i) => (
              <Reveal key={k} delay={i * 0.08}>
                <dt className="eyebrow mb-2 text-ink/45">{k}</dt>
                <dd className="display text-3xl italic">{v}</dd>
              </Reveal>
            ))}
          </dl>
          <div className="md:col-span-8 md:col-start-5">
            <Lines lines={[p.blurb]} className="display text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.08]" step={0} />
            <Reveal delay={0.1} className="mt-12 border-l border-clay pl-6">
              <p className="eyebrow mb-3 text-clay">The brief</p>
              <p className="max-w-xl text-lg leading-relaxed text-ink/75">{p.brief}</p>
            </Reveal>
            <div className="mt-14 max-w-xl space-y-6 text-[1.04rem] leading-[1.8] text-ink/70">
              {p.story.map((para, i) => (
                <Reveal key={i} delay={0.05}>
                  <p>{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section data-theme="light" className="px-6 pb-32 md:px-10 md:pb-44">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-12">
          <Reveal variant="image" className="md:col-span-7">
            <ParallaxImg src={p.gallery[0].src} position={p.gallery[0].position} className="aspect-[4/5] w-full" speed={0.07} />
            <p className="eyebrow mt-4 text-ink/50">{p.gallery[0].caption}</p>
          </Reveal>
          <Reveal variant="image" delay={0.15} className="md:col-span-4 md:col-start-9 md:mt-56">
            <ParallaxImg src={p.gallery[1].src} position={p.gallery[1].position} className="aspect-[3/4] w-full" speed={0.1} />
            <p className="eyebrow mt-4 text-ink/50">{p.gallery[1].caption}</p>
          </Reveal>
          <Reveal variant="image" className="md:col-span-10 md:col-start-2 md:mt-24">
            <ParallaxImg src={p.gallery[2].src} position={p.gallery[2].position} className="aspect-[16/9] w-full" speed={0.06} />
            <p className="eyebrow mt-4 text-ink/50">{p.gallery[2].caption}</p>
          </Reveal>
        </div>
      </section>

      {/* Materials + palette */}
      <section data-theme="dark" className="bg-ink px-6 py-28 text-bone md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow mb-6 text-bone/50">Palette &amp; materials</p>
            <Lines lines={["What it's", <em key="e" className="font-light text-sand">made of.</em>]} className="display text-[clamp(3rem,6vw,6rem)]" />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <ul className="divide-y divide-bone/15 border-y border-bone/15">
              {p.materials.map((m, i) => (
                <Reveal key={m} delay={i * 0.08}>
                  <li className="flex items-baseline justify-between py-5">
                    <span className="display text-3xl italic md:text-4xl">{m}</span>
                    <span className="eyebrow text-bone/40">0{i + 1}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <div className="mt-10 flex h-28 overflow-hidden arch-none">
              {p.palette.map((c, i) => (
                <Reveal key={c} delay={i * 0.1} className="flex-1" >
                  <div className="h-28" style={{ background: c }} />
                </Reveal>
              ))}
            </div>
            <p className="eyebrow mt-4 text-bone/40">
              Direction — <Link href="/begin?step=mood" className="ulink text-bone">{dir.name}</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Enquire */}
      <section data-theme="light" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px] text-center">
          <Reveal>
            <p className="eyebrow mb-6 text-ink/50">Drawn to this?</p>
            <h2 className="display mx-auto max-w-4xl text-[clamp(2.8rem,6vw,6rem)]">
              Tell us about a space <em className="font-light text-clay">like {p.title}.</em>
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href={`/begin?kind=${kind}`} className="btn btn-solid">
                Begin a project
              </Link>
              <Link href="/work" className="btn">
                All work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Next */}
      <Link href={`/work/${next.slug}`} data-theme="dark" className="group relative block h-[70svh] overflow-hidden bg-ink text-bone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={next.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[2200ms] group-hover:scale-105" style={{ objectPosition: next.position, transitionTimingFunction: "var(--ease)" }} />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="eyebrow mb-6 text-bone/70">Next project</p>
            <p className="display text-[clamp(4rem,12vw,13rem)] italic leading-[0.9]">{next.title}</p>
            <p className="eyebrow mt-6 text-bone/70">
              {next.place}, {next.state}
            </p>
          </div>
        </div>
      </Link>
      <Footer />
    </main>
  );
}
