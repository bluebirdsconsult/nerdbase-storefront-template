import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

function emptyStats() {
  return {
    total_orders: 0,
    total_completed: 0,
    total_failed: 0,
    total_processing: 0,
    total_pending: 0,
    total_spent: 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json(emptyStats());

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.ORDER_API_URL) return NextResponse.json(emptyStats());

    const { searchParams } = req.nextUrl;
    const qs = new URLSearchParams();
    ["status", "game_name", "created_at_from", "created_at_to"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) qs.set(k, v);
    });

    const url = `${process.env.ORDER_API_URL}/customer/orders/stats${qs.toString() ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json(emptyStats());
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(emptyStats());
  }
}
