import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Lines, Reveal } from "@/components/Reveal";
import { ParallaxImg } from "@/components/Parallax";
import { ProjectCard } from "@/components/ProjectCard";
import { OpenConcierge } from "@/components/OpenConcierge";
import { ScrollWords } from "@/components/home/ScrollWords";
import { MaterialsTrack } from "@/components/home/MaterialsTrack";
import { ServiceIndex } from "@/components/home/ServiceIndex";
import { IMG, STUDIO, directions, locationsList, processSteps, projects } from "@/lib/studio";

const byslug = (s: string) => projects.find((p) => p.slug === s)!;

export default function Home() {
  const dirs = Object.values(directions);
  return (
    <main>
      {/* ───────── HERO ───────── */}
      <section data-theme="light" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-plaster">
        <div className="kenburns absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.living} alt="A curved plaster living room opening to the ocean through an arch" className="h-full w-full object-cover" style={{ objectPosition: "28% 50%" }} fetchPriority="high" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-bone/65 via-bone/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink/65 via-ink/20 to-transparent" />

        <div className="absolute left-6 top-[19svh] md:left-10">
          <h1 className="display text-[clamp(3.6rem,9.4vw,10.5rem)] leading-[0.88] text-ink">
            <span className="line hero-line" style={{ ["--i" as string]: 0 }}><span>Rooms that</span></span>
            <span className="line hero-line" style={{ ["--i" as string]: 1 }}><span>hold the</span></span>
            <span className="line hero-line" style={{ ["--i" as string]: 2 }}><span><em className="font-light">light.</em></span></span>
          </h1>
        </div>

        <div className="hero-fade absolute right-6 top-[24svh] hidden origin-top-right md:right-10 md:block" style={{ ["--i" as string]: 3 }}>
          <p className="eyebrow [writing-mode:vertical-rl] text-ink/70">Interior Architecture &amp; Design — Est. 2012 — Sydney</p>
        </div>

        <div className="absolute inset-x-6 bottom-8 flex flex-col items-start justify-between gap-8 text-bone md:inset-x-10 md:bottom-10 md:flex-row md:items-end">
          <div className="hero-fade max-w-md" style={{ ["--i" as string]: 2 }}>
            <p className="text-[1.02rem] leading-relaxed text-bone/90">
              Halden Rowe designs calm, tactile homes, retreats and hospitality spaces across Australia — rooted in light, local material, and the way you actually live.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/begin" className="btn btn-light !bg-bone !text-ink" style={{ ["--fill" as string]: "var(--color-clay)", ["--hover" as string]: "var(--color-bone)" }}>
                Begin a project
              </Link>
              <Link href="/work" className="btn btn-light">
                View work
              </Link>
            </div>
          </div>
          <div className="hero-fade hidden items-center gap-4 md:flex" style={{ ["--i" as string]: 4 }}>
            <span className="eyebrow text-bone/80">{STUDIO.coords}</span>
            <span className="relative block h-12 w-px overflow-hidden bg-bone/30">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-bone" />
            </span>
          </div>
        </div>
        <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
      </section>

      {/* ───────── MANIFESTO ───────── */}
      <section data-theme="light" className="relative px-6 pb-32 pt-36 md:px-10 md:pb-44 md:pt-52">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-12">
          <p className="eyebrow text-ink/50 md:col-span-2">(01) The studio</p>
          <div className="md:col-span-10">
            <ScrollWords
              className="display text-[clamp(2.2rem,5.4vw,5.6rem)] leading-[1.02]"
              text="We design homes and hospitality spaces that feel *inevitable* — shaped by *light*, built from honest local material, and tuned to the quiet rhythm of how you *live*."
            />
            <div className="mt-20 grid gap-10 border-t border-ink/15 pt-10 md:grid-cols-3">
              {[
                ["2012", "Founded in a Paddington terrace by Imogen Halden and Tom Rowe"],
                ["140+", "Homes, retreats and venues completed across four states"],
                ["One", "Lead designer, from first coffee to the day we hand over the keys"],
              ].map(([n, t], i) => (
                <Reveal key={n} delay={i * 0.12}>
                  <p className="display text-7xl italic text-clay">{n}</p>
                  <p className="mt-4 max-w-[17rem] text-[0.95rem] leading-relaxed text-ink/65">{t}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── SELECTED WORK ───────── */}
      <section data-theme="light" id="work" className="relative px-6 pb-36 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-16 flex items-end justify-between gap-8 md:mb-24">
            <div>
              <p className="eyebrow mb-5 text-ink/50">(02) Selected work</p>
              <Lines lines={["Spaces we", <em key="e" className="font-light">remember fondly</em>]} className="display text-[clamp(3rem,7.4vw,7.6rem)]" />
            </div>
            <Link href="/work" className="eyebrow ulink hidden pb-4 md:block">
              All projects →
            </Link>
          </div>

          <div className="grid gap-y-24 md:grid-cols-12 md:gap-x-10 md:gap-y-36">
            <ProjectCard project={byslug("salt-house")} index={0} aspect="aspect-[5/6]" className="md:col-span-7" />
            <ProjectCard project={byslug("gum-ridge")} index={1} aspect="aspect-[4/5]" className="md:col-span-4 md:col-start-9 md:mt-48" />
            <ProjectCard project={byslug("ember")} index={3} aspect="aspect-[4/5]" className="md:col-span-5 md:col-start-2" />
            <ProjectCard project={byslug("clay-house")} index={5} aspect="aspect-[3/4]" className="md:col-span-5 md:col-start-8 md:mt-32" />
            <ProjectCard project={byslug("banksia-lane")} index={2} aspect="aspect-[16/9]" className="md:col-span-10 md:col-start-2" />
          </div>

          <div className="mt-24 text-center">
            <Link href="/work" className="btn">
              See all six projects
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── MATERIALS (horizontal) ───────── */}
      <MaterialsTrack />

      {/* ───────── SERVICES ───────── */}
      <section data-theme="light" id="services" className="relative px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12">
            <p className="eyebrow text-ink/50 md:col-span-2">(03) What we do</p>
            <Lines lines={["From first sketch", <em key="e" className="font-light">to last lamp.</em>]} className="display text-[clamp(3rem,7vw,7rem)] md:col-span-10" />
          </div>
          <ServiceIndex />
        </div>
      </section>

      {/* ───────── DIRECTION TEASER ───────── */}
      <section data-theme="light" className="relative overflow-hidden bg-plaster px-6 py-32 md:px-10 md:py-44">
        <div className="mx-auto grid max-w-[1500px] items-center gap-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6 text-ink/50">(04) Not sure where to begin?</p>
            <Lines lines={["Show us what", "feels like", <em key="e" className="font-light text-clay">home.</em>]} className="display text-[clamp(3.2rem,7vw,7rem)]" />
            <Reveal delay={0.3}>
              <p className="mt-10 max-w-lg text-[1.05rem] leading-relaxed text-ink/70">
                Choose a few images that move you. Tell us roughly how big the space is and what you hope for. In about two minutes we&rsquo;ll sketch a design direction, the materials that suit it, and an honest range for budget and fees — then you can hold a time with a designer.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link href="/begin" className="btn btn-solid">
                  Find your direction
                </Link>
                <OpenConcierge className="eyebrow ulink">or ask the concierge</OpenConcierge>
              </div>
              <ul className="mt-14 grid max-w-lg grid-cols-2 gap-x-8 gap-y-3 border-t border-ink/15 pt-6">
                {dirs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 text-sm text-ink/70">
                    <span className="flex gap-0.5">
                      {d.palette.slice(0, 3).map((c) => (
                        <span key={c} className="block h-3 w-3 rounded-full" style={{ background: c }} />
                      ))}
                    </span>
                    <span className="display text-xl italic text-ink">{d.name}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto grid h-[min(70svh,640px)] max-w-xl grid-cols-3 items-end gap-3 md:gap-5">
              <Reveal variant="arch" delay={0.1} className="h-[78%]">
                <ParallaxImg src={IMG.bush} position="50% 50%" className="h-full w-full arch" speed={0.06} />
              </Reveal>
              <Reveal variant="arch" delay={0.25} className="h-full">
                <ParallaxImg src={IMG.bathroom} position="50% 65%" className="h-full w-full arch" speed={0.1} />
              </Reveal>
              <Reveal variant="arch" delay={0.4} className="h-[64%]">
                <ParallaxImg src={IMG.restaurant} position="40% 50%" className="h-full w-full arch" speed={0.05} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── PROCESS ───────── */}
      <section data-theme="dark" className="relative bg-ink px-6 py-32 text-bone md:px-10 md:py-48">
        <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-6 text-bone/50">(05) How we work</p>
              <Lines lines={["Slow,", <em key="e" className="font-light text-sand">on purpose.</em>]} className="display text-[clamp(3.2rem,7vw,7rem)]" />
              <Reveal delay={0.2} className="mt-12 hidden lg:block">
                <ParallaxImg src={IMG.studio} position="50% 50%" className="aspect-[4/5] w-[78%] arch" speed={0.05} />
              </Reveal>
            </div>
          </div>
          <ol className="lg:col-span-7">
            {processSteps.map((s, i) => (
              <li key={s.n} className="border-t border-bone/15 py-12 first:border-t-0 first:pt-0 md:py-16">
                <Reveal>
                  <div className="flex items-start gap-8 md:gap-14">
                    <span className="display w-20 shrink-0 text-6xl italic text-ochre md:text-8xl">{s.n}</span>
                    <div>
                      <div className="flex items-baseline gap-5">
                        <h3 className="display text-5xl md:text-6xl">{s.title}</h3>
                        <span className="eyebrow !text-[0.6rem] text-bone/40">{s.meta}</span>
                      </div>
                      <p className="mt-6 max-w-lg text-[1rem] leading-relaxed text-bone/65">{s.text}</p>
                    </div>
                  </div>
                </Reveal>
                {i === processSteps.length - 1 && (
                  <Reveal delay={0.2} className="mt-14 pl-0 md:pl-[8.5rem]">
                    <Link href="/begin" className="btn btn-light">
                      Start the conversation
                    </Link>
                  </Reveal>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── TESTIMONIAL ───────── */}
      <section data-theme="light" className="relative px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 lg:grid-cols-12">
          <Reveal variant="arch" className="lg:col-span-4">
            <ParallaxImg src={IMG.detail} position="50% 45%" className="aspect-[3/4] w-full arch" speed={0.08} />
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="display text-[5rem] leading-none text-clay">&ldquo;</p>
            <Reveal>
              <blockquote className="display -mt-8 text-[clamp(2rem,4.2vw,4.4rem)] leading-[1.06]">
                They asked what we do on a Tuesday night — and then designed a house <em className="font-light">for exactly that.</em> It feels like it was always here.
              </blockquote>
            </Reveal>
            <Reveal delay={0.2} className="mt-12 flex items-center gap-5">
              <span className="block h-px w-14 bg-ink/40" />
              <p className="eyebrow text-ink/60">Clara &amp; James M. — Salt House, Bronte</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── MARQUEE ───────── */}
      <section data-theme="light" className="overflow-hidden border-y border-ink/15 py-10" aria-label="Places we've worked">
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {locationsList.map((l) => (
                <span key={l + k} className="display flex items-center whitespace-nowrap text-[clamp(3rem,7vw,6.5rem)] italic">
                  {l}
                  <span className="mx-8 block h-3 w-3 rounded-t-full border border-ink md:mx-12" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
