import type { Metadata } from "next";
import { LandingPage } from "../src/components/LandingPage";
import { createPageMetadata } from "../src/lib/site-metadata";
import { sitePages } from "../src/lib/site-config";
import { StructuredData } from "../src/components/StructuredData";
import { buildPageSchemas } from "../src/lib/site-schema";

export const metadata: Metadata = createPageMetadata(sitePages.home);

export default function HomePage() {
  return (
    <>
      <StructuredData data={buildPageSchemas(sitePages.home)} id="home-schema" />
      <LandingPage />
    </>
  );
}
