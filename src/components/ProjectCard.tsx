import Link from "next/link";
import { ParallaxImg } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/studio";

export function ProjectCard({
  project,
  index,
  aspect = "aspect-[4/5]",
  className = "",
  delay = 0,
}: {
  project: Project;
  index: number;
  aspect?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <Link href={`/work/${project.slug}`} className={`group block ${className}`}>
      <Reveal variant="image" delay={delay}>
        <div className={`relative overflow-hidden bg-plaster ${aspect}`}>
          <div className="absolute inset-0 transition-transform duration-[1600ms] group-hover:scale-[1.06]" style={{ transitionTimingFunction: "var(--ease)" }}>
            <ParallaxImg src={project.cover} alt={`${project.title}, ${project.place}`} position={project.position} speed={0.08} className="h-full w-full" />
          </div>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span
              className="eyebrow grid h-24 w-24 scale-50 place-items-center rounded-full bg-bone/90 text-ink opacity-0 backdrop-blur transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
              style={{ transitionTimingFunction: "var(--ease)" }}
            >
              View
            </span>
          </div>
        </div>
      </Reveal>
      <Reveal delay={delay + 0.15} className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className="display text-4xl italic leading-none md:text-5xl">{project.title}</h3>
          <p className="eyebrow mt-3 text-ink/55">
            {project.place}, {project.state} · {project.type} · {project.year}
          </p>
        </div>
        <span className="eyebrow pt-2 text-ink/35">{String(index + 1).padStart(2, "0")}</span>
      </Reveal>
    </Link>
  );
}
