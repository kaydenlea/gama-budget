import type { Metadata } from "next";
import { WaitlistPage } from "../../src/components/WaitlistPage";
import { createPageMetadata } from "../../src/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Waitlist",
  description:
    "PocketCurb's waitlist lane is being prepared for the MVP window with honest expectations, structured intake fields, and privacy-first follow-up.",
  path: "/waitlist",
  keywords: ["PocketCurb waitlist", "money app waitlist", "Safe-to-Spend waitlist"]
});

export default function WaitlistRoute() {
  return <WaitlistPage />;
}
