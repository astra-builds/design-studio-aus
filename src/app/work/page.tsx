import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Lines, Reveal } from "@/components/Reveal";
import { WorkIndex } from "@/components/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected homes, retreats and hospitality spaces by Halden Rowe across Australia.",
};

export default function WorkPage() {
  return (
    <main>
      <section data-theme="light" className="px-6 pb-40 pt-44 md:px-10 md:pt-56">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-20 grid gap-8 md:mb-28 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-6 text-ink/50">Index — 2022 to 2025</p>
              <Lines lines={["Work, and", <em key="e" className="font-light">the people in it.</em>]} className="display text-[clamp(3.4rem,9vw,9.5rem)]" />
            </div>
            <Reveal delay={0.3} className="md:col-span-4">
              <p className="max-w-sm text-[1.02rem] leading-relaxed text-ink/65">
                Six recent projects, from a cliff-top family home in Bronte to a sixty-four seat restaurant in Fitzroy. Every one began with a long conversation.
              </p>
            </Reveal>
          </div>
          <WorkIndex />
        </div>
      </section>
      <Footer />
    </main>
  );
}
