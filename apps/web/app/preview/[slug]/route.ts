import { mockupPreviews, type MockupPreviewSlug } from "../../../src/content/mockup-previews";
import {
  getMockupPreviewHtml,
  type PreviewCrop,
  type PreviewMotionMode,
  type PreviewVariant
} from "../../../src/lib/mockup-preview-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = new URL(request.url).searchParams;
  const cropParam = searchParams.get("crop");
  const motionParam = searchParams.get("motion");
  const variantParam = searchParams.get("variant");
  const crop =
    cropParam === "events" || cropParam === "eventDetails" || cropParam === "storiesSignature"
      ? cropParam
      : undefined;
  const motion: PreviewMotionMode = motionParam === "static" ? "static" : "active";
  const variant: PreviewVariant | undefined =
    variantParam === "trust" || variantParam === "walkthrough" ? variantParam : undefined;

  if (!(slug in mockupPreviews)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  }

  return new Response(await getMockupPreviewHtml(slug as MockupPreviewSlug, crop as PreviewCrop | undefined, motion, variant), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control":
        process.env.NODE_ENV === "production"
          ? "public, max-age=31536000, immutable"
          : "no-store, max-age=0",
      ...(process.env.NODE_ENV === "production"
        ? {}
        : {
            Pragma: "no-cache",
            Expires: "0"
          }),
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}
