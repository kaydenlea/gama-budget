import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "../src/components/SiteFooter";
import { SiteHeader } from "../src/components/SiteHeader";
import { StructuredData } from "../src/components/StructuredData";
import { rootMetadata, rootViewport } from "../src/lib/site-metadata";
import { buildSiteSchemas } from "../src/lib/site-schema";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US">
      <body className="min-h-screen antialiased">
        <StructuredData data={buildSiteSchemas()} id="site-schema" />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
