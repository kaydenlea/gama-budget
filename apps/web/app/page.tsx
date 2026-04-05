import type { Metadata } from "next";
import { LandingPage } from "../src/components/LandingPage";
import { createPageMetadata } from "../src/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Clarity Before Cleanup",
  description:
    "PocketCurb is building a premium decision-first finance product for Safe-to-Spend, forward-looking cash flow, shared-spending correctness, and less admin work.",
  path: "/",
  keywords: ["Safe-to-Spend", "decision-first budgeting", "forward-looking cash flow"]
});

export default function HomePage() {
  return <LandingPage />;
}
