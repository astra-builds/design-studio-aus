import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import { Header } from "@/components/Header";
import { Shell } from "@/components/Shell";
import { Concierge } from "@/components/Concierge";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Halden Rowe — Interior Architecture & Design, Sydney",
    template: "%s — Halden Rowe",
  },
  description:
    "Halden Rowe is an Australian interior architecture and design studio. Considered homes, retreats and hospitality spaces rooted in light, material and place.",
  openGraph: {
    title: "Halden Rowe — Interior Architecture & Design",
    description: "Rooms that hold the light. Considered interiors across Australia.",
    images: ["/images/hero-living.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <noscript>
          <style>{`.reveal,.img-reveal,.arch-reveal{opacity:1!important;transform:none!important;clip-path:none!important}.line>span{transform:none!important}.intro{display:none!important}`}</style>
        </noscript>
        <div className="intro" aria-hidden>
          <div className="text-center">
            <div className="intro-arch" />
            <p className="display text-4xl italic md:text-5xl">Halden Rowe</p>
            <p className="eyebrow mt-4 text-bone/50">Interior Architecture &amp; Design</p>
          </div>
        </div>
        <Header />
        <Shell>
          {children}
          <Concierge />
        </Shell>
      </body>
    </html>
  );
}
