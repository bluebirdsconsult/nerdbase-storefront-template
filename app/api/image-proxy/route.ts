import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy — forwards image requests from the CDN so that
 * receipt modals can load images with crossOrigin="anonymous" (needed for
 * html-to-image JPEG export) without hitting CORS restrictions.
 *
 * Usage: /api/image-proxy?url_b64=<base64-encoded-image-url>
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const urlB64 = searchParams.get("url_b64");

  if (!urlB64) {
    return new NextResponse("Missing url_b64 parameter", { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = decodeURIComponent(atob(urlB64));
  } catch {
    return new NextResponse("Invalid url_b64 encoding", { status: 400 });
  }

  // Allow only nerdbase CDN URLs
  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.endsWith("nerdbase.cloud")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl, { cache: "force-cache" });
    if (!upstream.ok) {
      return new NextResponse("Failed to fetch image from CDN", { status: 502 });
    }
    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Proxy error", { status: 502 });
  }
}
