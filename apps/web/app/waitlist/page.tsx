import type { Metadata } from "next";
import { WaitlistPage } from "../../src/components/WaitlistPage";
import { createPageMetadata } from "../../src/lib/site-metadata";
import { sitePages } from "../../src/lib/site-config";
import { StructuredData } from "../../src/components/StructuredData";
import { buildPageSchemas } from "../../src/lib/site-schema";

export const metadata: Metadata = createPageMetadata(sitePages.waitlist);

export default function WaitlistRoute() {
  return (
    <>
      <StructuredData data={buildPageSchemas(sitePages.waitlist)} id="waitlist-schema" />
      <WaitlistPage />
    </>
  );
}
