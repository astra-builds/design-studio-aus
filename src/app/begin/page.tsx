import type { Metadata } from "next";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";

export const metadata: Metadata = {
  title: "Begin a project",
  description:
    "Describe your space, discover a design direction, see an honest budget range and book a complimentary consultation with Halden Rowe.",
};

export default function BeginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <Journey />
    </Suspense>
  );
}
