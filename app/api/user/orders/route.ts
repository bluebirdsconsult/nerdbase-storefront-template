import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.ORDER_API_URL) {
      return NextResponse.json(emptyPage(1, 10));
    }

    const { searchParams } = req.nextUrl;
    const qs = new URLSearchParams();
    ["page", "limit", "status", "game_name", "created_at_from", "created_at_to"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) qs.set(k, v);
    });

    const url = `${process.env.ORDER_API_URL}/customer/orders${qs.toString() ? `?${qs}` : ""}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "th",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(emptyPage(1, 10));
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(emptyPage(1, 10));
  }
}

function emptyPage(page: number, limit: number) {
  return { data: [], total: 0, page, limit, total_pages: 0, has_next: false, has_previous: false };
}
