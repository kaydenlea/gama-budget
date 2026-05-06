import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";

const moduleDir = dirname(fileURLToPath(import.meta.url));
let materialSymbolsBase64: string | undefined;

function resolveAppRoot() {
  const candidates = [
    process.cwd(),
    join(process.cwd(), "apps", "web"),
    resolve(moduleDir, "../.."),
    resolve(moduleDir, "../../.."),
    resolve(moduleDir, "../../../.."),
    resolve(moduleDir, "../../../../.."),
  ];

  const appRootCandidate = candidates.find((candidatePath) =>
    existsSync(join(candidatePath, "src", "content", "mockups", "overview-screen.html")),
  );

  if (appRootCandidate) {
    return appRootCandidate;
  }

  return join(process.cwd(), "apps", "web");
}

const appRootDir = resolveAppRoot();
const MOCKUP_DIR = join(appRootDir, "src", "content", "mockups");
const MATERIAL_SYMBOLS_FONT = join(MOCKUP_DIR, "material-symbols-outlined.woff2");

function getMaterialSymbolsBase64() {
  if (materialSymbolsBase64 !== undefined) {
    return materialSymbolsBase64;
  }

  try {
    materialSymbolsBase64 = readFileSync(MATERIAL_SYMBOLS_FONT).toString("base64");
  } catch {
    materialSymbolsBase64 = "";
  }

  return materialSymbolsBase64;
}

function buildManropeFontFaces(): string {
  try {
    const manifestCandidates = [
      join(appRootDir, ".next", "server", "next-font-manifest.json"),
      join(appRootDir, ".next", "dev", "server", "next-font-manifest.json"),
    ];
    const manifestPath = manifestCandidates.find((path) => {
      try {
        readFileSync(path, "utf8");
        return true;
      } catch {
        return false;
      }
    });

    if (!manifestPath) {
      return "";
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      app?: Record<string, string[]>;
    };
    const files = Array.from(
      new Set(
        Object.values(manifest.app ?? {})
          .flat()
          .filter((file) => file.endsWith(".woff2")),
      ),
    );

    if (files.length === 0) return "";

    return files
      .map(
        (file) =>
          `@font-face { font-family: "Gama Mockup Manrope"; font-style: normal; font-weight: 200 800; font-display: block; src: url("/_next/${file}") format("woff2"); }`
      )
      .join("\n");
  } catch {
    return "";
  }
}

const MANROPE_FONT_CSS =
  buildManropeFontFaces() ||
  `@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");`;
const PREVIEW_CANVAS_WIDTH = 393;
const PREVIEW_CANVAS_HEIGHT = 852;
const STABLE_VIEWPORT = "width=393, initial-scale=1, maximum-scale=1, viewport-fit=cover";
const isDevelopment = process.env.NODE_ENV !== "production";

const previewHtmlCache = new Map<string, Promise<string>>();
export type PreviewCrop = "events" | "eventDetails" | "storiesSignature";
export type PreviewMotionMode = "active" | "static";
export type PreviewVariant = "framed" | "trust" | "walkthrough";

const materialSymbolCodepoints: Record<string, string> = {
  account_balance_wallet: "e850",
  add: "e145",
  add_circle: "e3ba",
  analytics: "ef3e",
  arrow_back: "e5c4",
  arrow_forward: "e5c8",
  bolt: "ea0b",
  calendar_today: "e935",
  call_split: "e0b6",
  celebration: "ea65",
  check: "e5ca",
  check_circle: "f0be",
  chevron_left: "e5cb",
  chevron_right: "e5cc",
  close: "e5cd",
  double_arrow: "ea50",
  download: "f090",
  edit: "f097",
  edit_note: "e745",
  expand_less: "e5ce",
  expand_more: "e5cf",
  favorite: "e87e",
  grid_view: "e9b0",
  group: "ea21",
  home_app_logo: "e295",
  insights: "f092",
  ios_share: "e6b8",
  keyboard_arrow_down: "e313",
  keyboard_arrow_up: "e316",
  keyboard_double_arrow_right: "eac9",
  layers: "e53b",
  more_horiz: "e5d3",
  my_location: "e55c",
  open_in_full: "f1ce",
  payments: "ef63",
  person: "f0d3",
  photo_camera: "e412",
  receipt_long: "ef6e",
  search: "e8b6",
  settings: "e8b8",
  share: "e80d",
  timeline: "e922",
  trending_up: "e8e5",
  tune: "e429",
};

function stabilizeViewport(source: string) {
  if (/<meta[^>]+name=["']viewport["']/i.test(source)) {
    return source.replace(
      /<meta([^>]+name=["']viewport["'][^>]+content=["'])[^"']*(["'][^>]*?)>/i,
      `<meta$1${STABLE_VIEWPORT}$2>`,
    );
  }

  return source.replace("</head>", `<meta content="${STABLE_VIEWPORT}" name="viewport"/></head>`);
}

function replaceMaterialSymbolLigatures(source: string) {
  return source.replace(
    /(<span\b[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>)([^<]+)(<\/span>)/gi,
    (_match, openTag: string, iconNameRaw: string, closeTag: string) => {
      const iconName = iconNameRaw.trim();
      const codepoint = materialSymbolCodepoints[iconName];

      if (!codepoint) {
        return `${openTag}${iconNameRaw}${closeTag}`;
      }

      return `${openTag}&#x${codepoint};${closeTag}`;
    },
  );
}

function buildSharedStyle(
  slug: MockupPreviewSlug,
  crop?: PreviewCrop,
  motion: PreviewMotionMode = "active",
  variant?: PreviewVariant,
) {
  const materialSymbolsFontBase64 = getMaterialSymbolsBase64();
  const materialSymbolsFontFace = materialSymbolsFontBase64
    ? `
    @font-face {
      font-family: "Material Symbols Outlined";
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url("data:font/woff2;base64,${materialSymbolsFontBase64}") format("woff2");
    }
    `
    : "";
  const preview = mockupPreviews[slug];
  const previewRootBackground = preview.mode === "page" ? "transparent" : preview.background;
  const previewContentInset = "1.35rem";
  const previewTopInset = "1.5rem";
  const cropOffsetY = crop === "events" ? -815 : crop === "eventDetails" ? -180 : 0;
  const cropStyle =
    cropOffsetY !== 0
      ? `
        body > :not(script):not(style) {
          transform: translateY(${cropOffsetY}px) !important;
        }
      `
      : "";
  const viewportStyle =
    preview.mode === "viewport"
      ? `
        .mobile-viewport,
        .mobile-container {
          width: 100% !important;
          max-width: none !important;
          min-height: 100vh !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
      `
      : "";
  const fixedNavStyle = preview.hideFixedNav
    ? `
        nav.fixed,
        .fixed.left-0.w-full.z-50 {
          display: none !important;
        }
      `
    : "";
  const trustContentInsetStyle =
    variant === "trust"
      ? `
        .preview-scale-root > .immersive-dark-top,
        .preview-scale-root > main,
        .preview-scale-root .mobile-viewport > .immersive-dark-top,
        .preview-scale-root .mobile-viewport > main,
        .preview-scale-root .mobile-container > .immersive-dark-top,
        .preview-scale-root .mobile-container > main {
          padding-top: ${previewTopInset} !important;
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root main.luminous-glass > header {
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root .trust-review-scale,
        .preview-scale-root .trust-add-scale {
          width: 100% !important;
          margin-left: 0 !important;
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root nav.fixed,
        .preview-scale-root nav.absolute {
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full h1,
        .preview-scale-root .overview-header-title,
        .preview-scale-root .trust-nav-pill h1 {
          line-height: 1 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full,
        .preview-scale-root .overview-header-pill,
        .preview-scale-root .trust-nav-pill {
          align-items: center !important;
          min-height: 2rem !important;
          padding-top: 0.42rem !important;
          padding-bottom: 0.42rem !important;
        }
      `
      : "";
  const walkthroughContentInsetStyle =
    variant === "walkthrough"
      ? `
        .preview-scale-root > .immersive-dark-top,
        .preview-scale-root > main,
        .preview-scale-root .mobile-viewport > .immersive-dark-top,
        .preview-scale-root .mobile-viewport > main,
        .preview-scale-root .mobile-container > .immersive-dark-top,
        .preview-scale-root .mobile-container > main {
          padding-top: ${previewTopInset} !important;
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root nav.fixed,
        .preview-scale-root nav.absolute {
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root main > .absolute.left-3.right-3,
        .preview-scale-root main > .absolute.left-3 {
          left: ${previewContentInset} !important;
          right: ${previewContentInset} !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full h1,
        .preview-scale-root .overview-header-title,
        .preview-scale-root .trust-nav-pill h1 {
          line-height: 1 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full,
        .preview-scale-root .overview-header-pill,
        .preview-scale-root .trust-nav-pill {
          align-items: center !important;
          min-height: 2rem !important;
          padding-top: 0.42rem !important;
          padding-bottom: 0.42rem !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full.px-4,
        .preview-scale-root .overview-header-pill,
        .preview-scale-root .trust-nav-pill {
          min-width: 7rem !important;
        }

        .preview-scale-root .ios-glass-pill,
        .preview-scale-root .bridge-glass {
          background: rgba(255, 255, 255, 0.98) !important;
          border-color: rgba(255, 255, 255, 0.7) !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
        }

        .preview-scale-root .glass-island.rounded-3xl,
        .preview-scale-root .glass-island.squircle-refined {
          background: rgba(245, 248, 252, 0.94) !important;
          border-color: rgba(255, 255, 255, 0.76) !important;
          box-shadow: 0 10px 24px rgba(32, 52, 75, 0.045) !important;
        }

        .preview-scale-root .glass-island.rounded-3xl > .bg-white,
        .preview-scale-root .glass-island.rounded-3xl > button,
        .preview-scale-root .glass-island.squircle-refined > .bg-white,
        .preview-scale-root .glass-island.squircle-refined > button,
        .preview-scale-root .glass-island.squircle-refined .inbox-item,
        .preview-scale-root .glass-island.squircle-refined .category-item {
          background-color: rgba(255, 255, 255, 0.98) !important;
          border-color: rgba(226, 232, 240, 0.52) !important;
        }

        .preview-scale-root .ios-glass-pill .absolute.-inset-y-1.-inset-x-1\\.5,
        .preview-scale-root .ios-glass-pill .w-full.bg-white\\/90 {
          background: rgba(246, 249, 252, 0.96) !important;
          border-color: rgba(148, 163, 184, 0.2) !important;
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.06) !important;
        }

        .preview-scale-root .ios-glass-pill .w-full.bg-white\\/90 button.bg-primary\\/92 {
          background: #20344b !important;
          box-shadow: 0 8px 16px rgba(18, 29, 44, 0.18) !important;
        }
      `
      : "";
  const framedContentInsetStyle =
    variant === "framed"
      ? `
        .preview-scale-root > .immersive-dark-top,
        .preview-scale-root > main,
        .preview-scale-root .mobile-viewport > .immersive-dark-top,
        .preview-scale-root .mobile-viewport > main,
        .preview-scale-root .mobile-container > .immersive-dark-top,
        .preview-scale-root .mobile-container > main {
          padding-top: ${previewTopInset} !important;
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root nav.fixed,
        .preview-scale-root nav.absolute {
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root main > .absolute.left-3.right-3,
        .preview-scale-root main > .absolute.left-3 {
          left: ${previewContentInset} !important;
          right: ${previewContentInset} !important;
        }

        .preview-scale-root main > .absolute.left-3.right-3 > .bg-white\\/10 {
          padding: 0 !important;
          background: transparent !important;
          border-color: transparent !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full h1,
        .preview-scale-root .overview-header-title,
        .preview-scale-root .trust-nav-pill h1 {
          line-height: 1 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        .preview-scale-root .glass-island-dark.rounded-full,
        .preview-scale-root .overview-header-pill,
        .preview-scale-root .trust-nav-pill {
          align-items: center !important;
          min-height: 2rem !important;
          padding-top: 0.42rem !important;
          padding-bottom: 0.42rem !important;
        }
      `
      : "";
  const overviewWalkthroughStyle =
    variant === "walkthrough" && slug === "overview-screen"
      ? `
        .preview-scale-root .mobile-viewport > .immersive-dark-top,
        .preview-scale-root .mobile-viewport > main {
          padding-top: ${previewTopInset} !important;
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root .mobile-viewport main > .absolute.left-3.right-3 {
          left: ${previewContentInset} !important;
          right: ${previewContentInset} !important;
        }

        .preview-scale-root .mobile-viewport > main.pt-24 {
          padding-top: 7.58rem !important;
        }
      `
      : "";
  const overviewFramedStyle =
    variant === "framed" && slug === "overview-screen"
      ? `
        .preview-scale-root .mobile-viewport > main.pt-24 {
          padding-top: 7.42rem !important;
        }
      `
      : "";
  const accountsWalkthroughInsetStyle =
    variant === "walkthrough" && slug === "accounts"
      ? `
        .preview-scale-root .mobile-container {
          width: 100% !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .preview-scale-root .mobile-container > .immersive-dark-top,
        .preview-scale-root .mobile-container > main {
          padding-left: ${previewContentInset} !important;
          padding-right: ${previewContentInset} !important;
        }

        .preview-scale-root .mobile-container main > .absolute.left-3.right-3 {
          left: ${previewContentInset} !important;
          right: ${previewContentInset} !important;
        }
      `
      : "";
  const accountsBridgeClearanceStyle =
    (slug === "accounts" || slug === "accounts-trust") && (variant === "walkthrough" || variant === "trust")
      ? `
        .preview-scale-root .mobile-container > main.pt-18 {
          padding-top: ${variant === "trust" ? "5.38rem" : "5.22rem"} !important;
        }
      `
      : "";
  const billsBridgeClearanceStyle =
    variant === "walkthrough" && slug === "bills"
      ? `
        .preview-scale-root > main.pt-18 {
          padding-top: 5.36rem !important;
        }
      `
      : "";
  const cashFlowBridgeClearanceStyle =
    variant === "walkthrough" && slug === "cash-flow"
      ? `
        .preview-scale-root > main.pt-26 {
          padding-top: 6.45rem !important;
        }
      `
      : "";
  const eventDetailsFramedStyle =
    variant === "framed" && slug === "event-details"
      ? `
        .preview-scale-root main > .absolute.left-3.right-3 > .bg-white\\/10 {
          padding: 0.38rem !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .preview-scale-root main > .max-w-md.mx-auto {
          padding-left: 0.55rem !important;
          padding-right: 0.55rem !important;
        }

        .preview-scale-root .event-details-scroll-shell > .immersive-dark-top {
          padding-top: 1.32rem !important;
          padding-left: 1.52rem !important;
          padding-right: 1.52rem !important;
        }

        .preview-scale-root .event-details-scroll-shell > .immersive-dark-top > header {
          max-width: none !important;
          margin-bottom: 2.75rem !important;
        }
      `
      : "";
  const overviewGreenStyle =
    slug === "overview-screen"
      ? `
        .preview-scale-root .ios-emerald-glass {
          background: rgba(116, 196, 76, 0.72) !important;
          border-color: rgba(116, 196, 76, 0.3) !important;
        }

        .preview-scale-root .chart-glow-emerald {
          filter: drop-shadow(0 0 8px rgba(116, 196, 76, 0.5)) !important;
        }

        .preview-scale-root #areaGradient stop[stop-color="rgba(16, 185, 129, 0.2)"] {
          stop-color: rgba(116, 196, 76, 0.2) !important;
        }

        .preview-scale-root #areaGradient stop[stop-color="rgba(16, 185, 129, 0)"] {
          stop-color: rgba(116, 196, 76, 0) !important;
        }

        .preview-scale-root #spendingGradient stop[stop-color="#10b981"] {
          stop-color: #74c44c !important;
        }
      `
      : "";
  const billsViewAllStyle =
    slug === "bills"
      ? `
        .preview-scale-root .glass-island.rounded-3xl > button.bg-transparent {
          background: transparent !important;
          box-shadow: none !important;
        }
      `
      : "";
  const previewVariantStyle =
    variant === "trust" && slug === "transactions-categorized"
      ? `
        .preview-scale-root .immersive-dark-top > .relative.z-20 {
          padding: 0 !important;
        }

        .preview-scale-root .immersive-dark-top > .relative.z-20 > header {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        .preview-scale-root .trust-nav-button {
          width: 2.5rem !important;
          height: 2.5rem !important;
        }

        .preview-scale-root .trust-nav-pill {
          padding: 0.375rem 1rem !important;
        }

        .preview-scale-root .trust-nav-pill h1 {
          font-size: 10px !important;
          letter-spacing: 0.18em !important;
        }

        .preview-scale-root > main {
          padding-left: 1.35rem !important;
          padding-right: 1.35rem !important;
        }
      `
      : "";
  const storySignatureStyle =
    crop === "storiesSignature"
      ? `
        .preview-scale-root > header,
        .preview-scale-root > footer,
        .preview-scale-root > footer * {
          display: none !important;
        }

        .preview-scale-root > main {
          min-height: 100% !important;
          height: 100% !important;
          padding-top: 1.55rem !important;
          padding-left: 1.55rem !important;
          padding-right: 1.55rem !important;
          padding-bottom: 1.2rem !important;
          align-items: stretch !important;
        }

        .preview-scale-root .story-scroll-shell > .w-full:first-child {
          width: calc(100% - 1.1rem) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .preview-scale-root > main > .absolute.left-3.top-64.bottom-60 {
          top: 6.3rem !important;
          bottom: 1.4rem !important;
        }

        .preview-scale-root h1.text-\\[72px\\] {
          font-size: 3.6rem !important;
          line-height: 0.92 !important;
        }

        .preview-scale-root p.text-white\\/90.text-\\[18px\\] {
          max-width: 14.6rem !important;
          font-size: 0.92rem !important;
          line-height: 1.42 !important;
        }

        .preview-scale-root .glass-ios {
          width: min(100%, 19.5rem) !important;
          max-width: none !important;
          padding: 1.25rem !important;
          margin-bottom: 1rem !important;
        }

        .preview-scale-root .story-success-card .glass-ios {
          width: 100% !important;
          padding: 0.58rem 0.78rem !important;
          margin-bottom: 0 !important;
        }

        .preview-scale-root .story-success-confetti {
          top: 0.9rem !important;
        }
      `
      : "";
  const typographyNormalizationStyle = `
    .preview-scale-root {
      font-weight: 500 !important;
      font-optical-sizing: auto !important;
      font-synthesis-weight: none !important;
    }
    .preview-scale-root .font-normal {
      font-weight: 400 !important;
    }
    .preview-scale-root .font-medium {
      font-weight: 500 !important;
    }
    .preview-scale-root .font-semibold {
      font-weight: 600 !important;
    }
    .preview-scale-root .font-bold {
      font-weight: 700 !important;
    }
    .preview-scale-root .font-extrabold,
    .preview-scale-root .font-black {
      font-weight: 800 !important;
    }
    .preview-scale-root .tabular-nums,
    .preview-scale-root .showcase-soft-number,
    .preview-scale-root .showcase-soft-total,
    .preview-scale-root .glass-popup .text-sm.font-black,
    .preview-scale-root .transaction-card p.text-\\[13px\\].font-black,
    .preview-scale-root .inbox-item .text-\\[13px\\].font-black,
    .preview-scale-root .category-item .text-\\[12px\\].font-black {
      font-weight: 800 !important;
      letter-spacing: -0.03em !important;
      font-variant-numeric: tabular-nums lining-nums !important;
      font-feature-settings: "tnum" 1, "lnum" 1 !important;
    }
    .preview-scale-root .glass-popup .text-sm.font-black,
    .preview-scale-root .transaction-card p.text-\\[13px\\].font-black,
    .preview-scale-root .inbox-item .text-\\[13px\\].font-black,
    .preview-scale-root .category-item .text-\\[12px\\].font-black {
      letter-spacing: -0.025em !important;
    }
    .preview-scale-root [class*="tracking-widest"] {
      letter-spacing: 0.07em !important;
    }
    .preview-scale-root [class*="tracking-wider"] {
      letter-spacing: 0.035em !important;
    }
    .preview-scale-root [class*="tracking-wide"] {
      letter-spacing: 0.02em !important;
    }
    `;
  const topNavConsistencyStyle = `
    .preview-scale-root .immersive-dark-top > header > div.glass-island-dark:not(.w-10):not(.h-10) {
      min-width: 0 !important;
      flex: 0 0 auto !important;
      width: fit-content !important;
      max-width: none !important;
      padding: 0.42rem 0.96rem !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      border-radius: 9999px !important;
    }
    .preview-scale-root .immersive-dark-top > header > div.glass-island-dark:not(.w-10):not(.h-10) h1 {
      margin: 0 !important;
      font-size: 0.66rem !important;
      line-height: 1 !important;
      letter-spacing: 0.22em !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
    }
  `;
  const staticMotionStyle =
    motion === "static"
      ? `
    html[data-preview-motion="static"] *,
    html[data-preview-motion="static"] *::before,
    html[data-preview-motion="static"] *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
      will-change: auto !important;
    }
  `
      : "";

  return `
    ${MANROPE_FONT_CSS}

    ${materialSymbolsFontFace}
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      min-height: 100% !important;
      width: 100% !important;
      overflow-x: hidden !important;
      background: ${previewRootBackground} !important;
    }
    body {
      min-height: 100vh !important;
      isolation: isolate;
    }
    html[data-preview-scale="managed"],
    html[data-preview-scale="managed"] body {
      width: 100% !important;
      height: 100% !important;
      min-width: 100% !important;
      min-height: 100% !important;
      overflow: hidden !important;
    }
    html[data-preview-scale="managed"] body {
      position: relative !important;
      margin: 0 !important;
      background: ${previewRootBackground} !important;
    }
    .preview-scale-root {
      --mockup-font-sans: "Gama Mockup Manrope", "Manrope", "Segoe UI Variable Display", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: ${PREVIEW_CANVAS_WIDTH}px !important;
      min-width: ${PREVIEW_CANVAS_WIDTH}px !important;
      max-width: ${PREVIEW_CANVAS_WIDTH}px !important;
      height: ${PREVIEW_CANVAS_HEIGHT}px !important;
      min-height: ${PREVIEW_CANVAS_HEIGHT}px !important;
      max-height: ${PREVIEW_CANVAS_HEIGHT}px !important;
      overflow: hidden !important;
      background: ${preview.background} !important;
      transform-origin: top left !important;
      font-family: var(--mockup-font-sans) !important;
      font-synthesis: none !important;
      font-kerning: normal !important;
      -webkit-font-smoothing: antialiased !important;
      text-rendering: optimizeLegibility !important;
    }
    * {
      box-sizing: border-box;
    }
    .preview-scale-root,
    .preview-scale-root *:not(.material-symbols-outlined):not(.material-symbol-icon) {
      font-family: var(--mockup-font-sans) !important;
    }
    ${typographyNormalizationStyle}
    ${topNavConsistencyStyle}
    .material-symbols-outlined {
      font-family: "Material Symbols Outlined" !important;
      font-weight: normal !important;
      font-style: normal !important;
      line-height: 1 !important;
      letter-spacing: normal !important;
      text-transform: none !important;
      display: inline-block !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: "liga";
      font-feature-settings: "liga";
      -webkit-font-smoothing: antialiased;
    }
    .material-symbol-icon {
      display: inline-block !important;
      width: 1em !important;
      height: 1em !important;
      vertical-align: middle !important;
      flex-shrink: 0 !important;
    }
    .preview-scale-root svg[preserveaspectratio="none"] circle,
    .preview-scale-root svg[preserveAspectRatio="none"] circle {
      transform-box: fill-box !important;
      transform-origin: center !important;
      transform: scaleX(0.66) !important;
    }
    ${viewportStyle}
    ${fixedNavStyle}
    ${trustContentInsetStyle}
    ${walkthroughContentInsetStyle}
    ${framedContentInsetStyle}
    ${overviewWalkthroughStyle}
    ${overviewFramedStyle}
    ${accountsWalkthroughInsetStyle}
    ${accountsBridgeClearanceStyle}
    ${billsBridgeClearanceStyle}
    ${cashFlowBridgeClearanceStyle}
    ${eventDetailsFramedStyle}
    ${overviewGreenStyle}
    ${billsViewAllStyle}
    ${previewVariantStyle}
    ${storySignatureStyle}
    ${cropStyle}
    ${staticMotionStyle}
  `;
}

function buildScalingScriptForCrop(
  slug: MockupPreviewSlug,
  crop?: PreviewCrop,
  motion: PreviewMotionMode = "active",
) {
  const mode = crop === "storiesSignature" ? "cover-top" : "cover";

  return `
    <script>
      (() => {
        const canvasWidth = ${PREVIEW_CANVAS_WIDTH};
        const canvasHeight = ${PREVIEW_CANVAS_HEIGHT};
        const mode = "${mode}";
        const motion = "${motion}";
        let hasPostedReady = false;
        const postReady = () => {
          if (hasPostedReady) {
            return;
          }

          hasPostedReady = true;
          document.documentElement.dataset.previewReady = "true";
          let readyPostCount = 0;
          const sendReady = () => {
            readyPostCount += 1;
            window.parent?.postMessage(
              {
                type: "gama-preview-ready",
                token: window.name
              },
              "*"
            );

            if (readyPostCount >= 5) {
              window.clearInterval(readyInterval);
            }
          };
          const readyInterval = window.setInterval(sendReady, 120);
          sendReady();
        };
        const scheduleReady = () => {
          const fontsReady = document.fonts?.ready ?? Promise.resolve();

          fontsReady
            .catch(() => undefined)
            .then(() => {
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(postReady);
              });
            });
        };
        const normalizeLetterSpacing = () => {
          const root = document.querySelector(".preview-scale-root");

          if (!root) {
            return;
          }

          const namedWideSelectors = [
            '[class*="tracking-widest"]',
            '[class*="tracking-wider"]',
            '[class*="tracking-wide"]'
          ];
          const arbitraryTrackingSelector = '[class*="tracking-["]';

          root.querySelectorAll(namedWideSelectors.join(",")).forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }

            if (node.className.includes("tracking-widest")) {
              node.style.setProperty("letter-spacing", "0.07em", "important");
              return;
            }

            if (node.className.includes("tracking-wider")) {
              node.style.setProperty("letter-spacing", "0.035em", "important");
              return;
            }

            if (node.className.includes("tracking-wide")) {
              node.style.setProperty("letter-spacing", "0.02em", "important");
            }
          });

          root.querySelectorAll(arbitraryTrackingSelector).forEach((node) => {
            if (node instanceof HTMLElement) {
              const trackingClass = node.className
                .split(" ")
                .find((token) => token.startsWith("tracking-[") && token.endsWith("]"));

              if (!trackingClass) {
                return;
              }

              const numericPortion = trackingClass.slice("tracking-[".length, -"]".length);

              if (!numericPortion.endsWith("em")) {
                return;
              }

              const value = Number.parseFloat(numericPortion.slice(0, -"em".length));

              if (Number.isFinite(value) && value > 0.08) {
                const softened = Math.max(0.02, Math.round(value * 0.7 * 1000) / 1000);
                node.style.setProperty("letter-spacing", softened + "em", "important");
              }
            }
          });
        };

        const ensureRoot = () => {
          const existing = document.querySelector(".preview-scale-root");

          if (existing) {
            return existing;
          }

          const root = document.createElement("div");
          root.className = "preview-scale-root";

          while (document.body.firstChild) {
            root.appendChild(document.body.firstChild);
          }

          document.body.appendChild(root);
          return root;
        };

        const applyScale = () => {
          const widthScale = window.innerWidth / canvasWidth;
          const heightScale = window.innerHeight / canvasHeight;
          const nextScale =
            mode === "cover" || mode === "cover-top"
              ? Math.max(widthScale, heightScale)
              : Math.min(widthScale, heightScale);
          const overscanScale = nextScale;
          const root = ensureRoot();
          const offsetX =
            mode === "cover" || mode === "cover-top"
              ? (window.innerWidth - canvasWidth * overscanScale) / 2
              : Math.max((window.innerWidth - canvasWidth * overscanScale) / 2, 0);
          const offsetY =
            mode === "cover-top"
              ? Math.min((window.innerHeight - canvasHeight * overscanScale) * 0.22, 0)
              : mode === "cover"
                ? (window.innerHeight - canvasHeight * overscanScale) / 2
              : Math.max((window.innerHeight - canvasHeight * overscanScale) / 2, 0);

          document.documentElement.dataset.previewScale = "managed";
          document.documentElement.dataset.previewMotion = motion;
          document.body.style.width = "100%";
          document.body.style.height = "100%";
          root.style.zoom = "";
          root.style.transform = "translate(" + offsetX + "px, " + offsetY + "px) scale(" + overscanScale + ")";
          normalizeLetterSpacing();
          scheduleReady();
        };

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", applyScale, { once: true });
        } else {
          applyScale();
        }

        window.addEventListener("resize", applyScale, { passive: true });
      })();
    </script>
  `;
}

async function buildPreviewHtmlInternal(
  slug: MockupPreviewSlug,
  crop?: PreviewCrop,
  motion: PreviewMotionMode = "active",
  variant?: PreviewVariant,
) {
  const source = readFileSync(join(MOCKUP_DIR, mockupPreviews[slug].file), "utf8");
  const sharedStyle = buildSharedStyle(slug, crop, motion, variant);
  const previewSource = replaceMaterialSymbolLigatures(stabilizeViewport(source));
  const scalingScript = buildScalingScriptForCrop(slug, crop, motion);

  return previewSource
    .replace("</head>", `<style>${sharedStyle}</style></head>`)
    .replace("</body>", `${scalingScript}</body>`);
}

export function getMockupPreviewHtml(
  slug: MockupPreviewSlug,
  crop?: PreviewCrop,
  motion: PreviewMotionMode = "active",
  variant?: PreviewVariant,
) {
  if (isDevelopment) {
    return buildPreviewHtmlInternal(slug, crop, motion, variant);
  }

  if (slug === "overview-screen") {
    return buildPreviewHtmlInternal(slug, crop, motion, variant);
  }

  if (crop || variant) {
    return buildPreviewHtmlInternal(slug, crop, motion, variant);
  }

  const cacheKey = `${slug}:${motion}`;
  const cached = previewHtmlCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const previewPromise = buildPreviewHtmlInternal(slug, undefined, motion).catch((error) => {
    previewHtmlCache.delete(cacheKey);
    throw error;
  });
  previewHtmlCache.set(cacheKey, previewPromise);

  return previewPromise;
}
