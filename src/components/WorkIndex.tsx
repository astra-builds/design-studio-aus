"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/studio";

const filters = ["All", "Residential", "Retreat", "Apartment", "Hospitality"] as const;

export function WorkIndex() {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = projects.filter((p) => f === "All" || p.type === f);
  return (
    <div>
      <div className="no-scrollbar mb-16 flex gap-3 overflow-x-auto border-b border-ink/15 pb-6 md:mb-24">
        {filters.map((x) => {
          const count = x === "All" ? projects.length : projects.filter((p) => p.type === x).length;
          return (
            <button
              key={x}
              onClick={() => setF(x)}
              className={`eyebrow shrink-0 rounded-full border px-5 py-3 transition-colors duration-500 ${
                f === x ? "border-ink bg-ink text-bone" : "border-ink/20 hover:border-ink"
              }`}
            >
              {x} <span className="ml-1 opacity-50">{count}</span>
            </button>
          );
        })}
      </div>
      <div key={f} className="grid gap-x-10 gap-y-24 md:grid-cols-2 md:gap-y-32">
        {list.map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            index={projects.indexOf(p)}
            aspect={i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[1/1]" : "aspect-[5/6]"}
            className={i % 2 === 1 ? "md:mt-40" : ""}
            delay={(i % 2) * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
