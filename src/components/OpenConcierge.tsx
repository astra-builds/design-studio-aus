"use client";

export function OpenConcierge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("open-concierge"))}>
      {children}
    </button>
  );
}
