import Link from "next/link";
import { STUDIO, waLink } from "@/lib/studio";

export function Footer() {
  return (
    <footer data-theme="dark" className="relative overflow-hidden bg-ink px-6 pb-10 pt-28 text-bone md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow mb-8 text-bone/50">Tea, plaster samples &amp; a long conversation</p>
            <h2 className="display text-[clamp(3.2rem,8vw,8.5rem)]">
              Let&rsquo;s make <br />
              <em className="font-light text-sand">somewhere</em> good.
            </h2>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link href="/begin" className="btn btn-light !bg-bone !text-ink" style={{ ["--fill" as string]: "var(--color-clay)", ["--hover" as string]: "var(--color-bone)" }}>
                Begin a project
              </Link>
              <a
                href={waLink("Hi Halden Rowe — I'd love to talk about a project.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-light"
              >
                WhatsApp the studio
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-6 md:pl-16">
            <div>
              <p className="eyebrow mb-5 text-bone/50">Studio</p>
              <address className="not-italic leading-relaxed text-bone/85">
                {STUDIO.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
                <span className="mt-4 block text-bone/50">By appointment, Mon–Fri</span>
              </address>
            </div>
            <div>
              <p className="eyebrow mb-5 text-bone/50">Say hello</p>
              <ul className="space-y-2 text-bone/85">
                <li>
                  <a className="ulink" href={`mailto:${STUDIO.email}`}>
                    {STUDIO.email}
                  </a>
                </li>
                <li>
                  <a className="ulink" href={`tel:${STUDIO.phone.replace(/\s/g, "")}`}>
                    {STUDIO.phone}
                  </a>
                </li>
                <li>
                  <a className="ulink" href={waLink("Hi Halden Rowe")} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5 text-bone/50">Explore</p>
              <ul className="space-y-2 text-bone/85">
                {[
                  ["Work", "/work"],
                  ["Studio", "/studio"],
                  ["Begin", "/begin"],
                ].map(([l, h]) => (
                  <li key={h}>
                    <Link className="ulink" href={h}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5 text-bone/50">Acknowledgement</p>
              <p className="text-sm leading-relaxed text-bone/60">
                We work on Gadigal and Wangal Country and acknowledge the Traditional Custodians of the lands on which we design and build, and pay respect to Elders past and present.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col justify-between gap-4 border-t border-bone/15 pt-6 text-xs text-bone/45 md:flex-row">
          <p>© {new Date().getFullYear()} {STUDIO.name} Pty Ltd · {STUDIO.descriptor}</p>
          <p>{STUDIO.coords} · Paddington, Sydney</p>
        </div>
      </div>
      <p
        aria-hidden
        className="display pointer-events-none absolute -bottom-[0.28em] left-1/2 -translate-x-1/2 whitespace-nowrap text-[22vw] italic leading-none text-bone/[0.04]"
      >
        Halden Rowe
      </p>
    </footer>
  );
}
