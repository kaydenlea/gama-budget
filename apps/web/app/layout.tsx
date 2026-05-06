import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "../src/components/SiteFooter";
import { SiteHeader } from "../src/components/SiteHeader";
import { StructuredData } from "../src/components/StructuredData";
import { rootMetadata, rootViewport } from "../src/lib/site-metadata";
import { buildSiteSchemas } from "../src/lib/site-schema";

export const metadata = rootMetadata;
export const viewport = rootViewport;

const siteFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-site"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={siteFont.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: "Manrope Fallback";
            src: local("Arial");
            ascent-override: 103.31%;
            descent-override: 29.07%;
            line-gap-override: 0%;
            size-adjust: 103.19%;
          }
        `}} />
      </head>
      <body className={`${siteFont.className} min-h-screen antialiased`}>
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
