import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import vm from "node:vm";
import { compile } from "tailwindcss";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";

const MOCKUP_DIR = join(process.cwd(), "src", "content", "mockups");
const TAILWIND_ENTRY = resolve(process.cwd(), "node_modules", "tailwindcss", "index.css");
const MATERIAL_SYMBOLS_FONT = join(MOCKUP_DIR, "material-symbols-outlined.woff2");
const MATERIAL_SYMBOLS_BASE64 = readFileSync(MATERIAL_SYMBOLS_FONT).toString("base64");
const PREVIEW_CANVAS_WIDTH = 393;
const PREVIEW_CANVAS_HEIGHT = 852;
const STABLE_VIEWPORT = "width=393, initial-scale=1, maximum-scale=1, viewport-fit=cover";
const isDevelopment = process.env.NODE_ENV !== "production";

const previewHtmlCache = new Map<MockupPreviewSlug, Promise<string>>();
export type PreviewCrop = "events" | "eventDetails";

type TailwindConfig = Record<string, unknown>;

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
  tune: "e429"
};

function extractTailwindConfig(source: string): TailwindConfig {
  const match = source.match(/<script id="tailwind-config">([\s\S]*?)<\/script>/i);

  if (!match) {
    return {};
  }

  const context = { tailwind: {} as { config?: TailwindConfig } };
  vm.runInNewContext(match[1] ?? "", context, { timeout: 100 });

  return context.tailwind.config ?? {};
}

function normalizeTailwindConfig(config: TailwindConfig): TailwindConfig {
  const clone = structuredClone(config);
  const theme = (clone.theme ?? {}) as Record<string, unknown>;
  const extend = (theme.extend ?? {}) as Record<string, unknown>;
  const fontFamily = (extend.fontFamily ?? {}) as Record<string, unknown>;
  const stableSans = [
    "Aptos",
    "\"Segoe UI Variable Display\"",
    "\"SF Pro Display\"",
    "\"Helvetica Neue\"",
    "Arial",
    "sans-serif"
  ];
  const stableMono = [
    "\"JetBrains Mono\"",
    "\"SFMono-Regular\"",
    "Menlo",
    "Monaco",
    "Consolas",
    "\"Liberation Mono\"",
    "\"Courier New\"",
    "monospace"
  ];

  for (const [key, value] of Object.entries(fontFamily)) {
    if (!Array.isArray(value)) {
      continue;
    }

    fontFamily[key] = value.includes("JetBrains Mono") ? stableMono : stableSans;
  }

  extend.fontFamily = fontFamily;
  theme.extend = extend;
  clone.theme = theme;

  return clone;
}

function extractTailwindCandidates(source: string) {
  const candidates = new Set<string>();
  const classPattern = /class(?:Name)?\s*=\s*(?:"([^"]+)"|'([^']+)')/g;

  for (const match of source.matchAll(classPattern)) {
    const classValue = match[1] ?? match[2] ?? "";

    for (const candidate of classValue.split(/\s+/)) {
      if (candidate.trim()) {
        candidates.add(candidate.trim());
      }
    }
  }

  return Array.from(candidates);
}

function stripRuntimeDependencies(source: string) {
  return source
    .replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>\s*/gi, "")
    .replace(/<script id="tailwind-config">[\s\S]*?<\/script>\s*/gi, "")
    .replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Manrope[^"]*" rel="stylesheet"\/>\s*/gi,
      ""
    )
    .replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined[^"]*" rel="stylesheet"\/>\s*/gi,
      ""
    )
    .replace(
      /font-family:\s*'Manrope',\s*sans-serif;/gi,
      "font-family: Aptos, 'Segoe UI Variable Display', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;"
    );
}

function stabilizeViewport(source: string) {
  if (/<meta[^>]+name=["']viewport["']/i.test(source)) {
    return source.replace(
      /<meta([^>]+name=["']viewport["'][^>]+content=["'])[^"']*(["'][^>]*?)>/i,
      `<meta$1${STABLE_VIEWPORT}$2>`
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
    }
  );
}

async function compileTailwindCss(source: string) {
  const candidates = extractTailwindCandidates(source);
  const compiler = await compile('@config "./mockup-preview.config.js"; @import "tailwindcss";', {
    base: MOCKUP_DIR,
    loadModule: async (id, base) => {
      const config = normalizeTailwindConfig(extractTailwindConfig(source));
      const path = resolve(base, id);

      return {
        path,
        base: dirname(path),
        module: config
      };
    },
    loadStylesheet: async (id, base) => {
      if (id === "tailwindcss") {
        return {
          path: TAILWIND_ENTRY,
          base: dirname(TAILWIND_ENTRY),
          content: await readFile(TAILWIND_ENTRY, "utf8")
        };
      }

      const path = resolve(base, id);
      return {
        path,
        base: dirname(path),
        content: await readFile(path, "utf8")
      };
    }
  });

  return compiler.build(candidates);
}

function buildSharedStyle(slug: MockupPreviewSlug, crop?: PreviewCrop) {
  const preview = mockupPreviews[slug];
  const previewRootBackground = preview.mode === "page" ? "transparent" : preview.background;
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
  const previewVariantStyle =
    slug === "accounts" || slug === "accounts-trust"
      ? `
        .preview-scale-root .mobile-container > main {
          padding-top: 2rem !important;
        }

        .preview-scale-root .mobile-container > main > div.absolute {
          display: none !important;
        }

        .preview-scale-root .glass-island,
        .preview-scale-root .glass-island-dark,
        .preview-scale-root .ios-glass-pill,
        .preview-scale-root .ios-emerald-glass,
        .preview-scale-root [class*="backdrop-blur"] {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
        }

        .preview-scale-root .glass-island-dark {
          background: rgba(32, 41, 50, 0.96) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          box-shadow: none !important;
        }

        .preview-scale-root .glass-island {
          background: rgba(243, 247, 251, 0.98) !important;
          border-color: rgba(255, 255, 255, 0.78) !important;
          box-shadow: none !important;
        }

        .preview-scale-root .ios-glass-pill {
          background: rgba(245, 248, 252, 0.98) !important;
          border-color: rgba(226, 233, 241, 0.92) !important;
          box-shadow: 0 8px 20px rgba(15, 23, 32, 0.08) !important;
        }

        .preview-scale-root .ios-emerald-glass {
          background: rgba(116, 196, 76, 0.92) !important;
          border-color: rgba(116, 196, 76, 0.96) !important;
          box-shadow: none !important;
        }

        .preview-scale-root .immersive-dark-top .bg-black\\/20 {
          background: rgba(14, 24, 31, 0.96) !important;
        }

        .preview-scale-root .immersive-dark-top .bg-white\\/10 {
          background: rgba(255, 255, 255, 0.14) !important;
        }
      `
      : "";

  return `
    @font-face {
      font-family: "Material Symbols Outlined";
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url("data:font/woff2;base64,${MATERIAL_SYMBOLS_BASE64}") format("woff2");
    }
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
      position: relative !important;
    }
    body::before {
      content: "" !important;
      position: fixed !important;
      inset: 0 !important;
      background: ${preview.background} !important;
      pointer-events: none !important;
      z-index: -1 !important;
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
      will-change: transform !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      contain: paint !important;
    }
    * {
      box-sizing: border-box;
    }
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
    ${viewportStyle}
    ${fixedNavStyle}
    ${previewVariantStyle}
    ${cropStyle}
  `;
}

function buildScalingScript(slug: MockupPreviewSlug) {
  const useZoomScaling = slug === "accounts" || slug === "accounts-trust";

  return `
    <script>
      (() => {
        const canvasWidth = ${PREVIEW_CANVAS_WIDTH};
        const canvasHeight = ${PREVIEW_CANVAS_HEIGHT};
        const useZoomScaling = ${useZoomScaling ? "true" : "false"};

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
          const nextScale = Math.min(widthScale, heightScale);
          const overscanScale = nextScale + 0.003;
          const root = ensureRoot();
          const offsetX = Math.max((window.innerWidth - canvasWidth * overscanScale) / 2, 0);
          const offsetY = Math.max((window.innerHeight - canvasHeight * overscanScale) / 2, 0);

          document.documentElement.dataset.previewScale = "managed";
          document.body.style.width = "100%";
          document.body.style.height = "100%";
          if (useZoomScaling) {
            root.style.transform = "none";
            root.style.zoom = String(overscanScale);
            root.style.left = (offsetX / overscanScale) + "px";
            root.style.top = (offsetY / overscanScale) + "px";
          } else {
            root.style.zoom = "";
            root.style.left = "0px";
            root.style.top = "0px";
            root.style.transform = "translate(" + offsetX + "px, " + offsetY + "px) scale(" + overscanScale + ")";
          }
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

async function buildPreviewHtmlInternal(slug: MockupPreviewSlug, crop?: PreviewCrop) {
  const source = readFileSync(join(MOCKUP_DIR, mockupPreviews[slug].file), "utf8");
  const tailwindCss = await compileTailwindCss(source);
  const sharedStyle = buildSharedStyle(slug, crop);
  const previewSource = replaceMaterialSymbolLigatures(stabilizeViewport(stripRuntimeDependencies(source)));
  const scalingScript = buildScalingScript(slug);

  return previewSource
    .replace("</head>", `<style>${tailwindCss}\n${sharedStyle}</style></head>`)
    .replace("</body>", `${scalingScript}</body>`);
}

export function getMockupPreviewHtml(slug: MockupPreviewSlug, crop?: PreviewCrop) {
  if (isDevelopment) {
    return buildPreviewHtmlInternal(slug, crop);
  }

  if (crop) {
    return buildPreviewHtmlInternal(slug, crop);
  }

  const cached = previewHtmlCache.get(slug);

  if (cached) {
    return cached;
  }

  const previewPromise = buildPreviewHtmlInternal(slug).catch((error) => {
    previewHtmlCache.delete(slug);
    throw error;
  });
  previewHtmlCache.set(slug, previewPromise);

  return previewPromise;
}
