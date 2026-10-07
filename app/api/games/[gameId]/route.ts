import { NextRequest, NextResponse } from "next/server";

const GAME_CATALOG_API_URL = process.env.GAME_CATALOG_API_URL;
const BUSINESS_PROFILE_ID = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  if (!GAME_CATALOG_API_URL || !BUSINESS_PROFILE_ID) {
    return NextResponse.json({ error: "API not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${GAME_CATALOG_API_URL}/customer/${encodeURIComponent(BUSINESS_PROFILE_ID)}/game/${encodeURIComponent(gameId)}`,
      {
        headers: { "Content-Type": "application/json", "Accept-Language": "th" },
        next: { revalidate: 60 },
      }
    );

    if (res.status === 404) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
