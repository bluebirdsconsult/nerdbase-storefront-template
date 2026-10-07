import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${process.env.CUSTOMER_CREDIT_API_URL}/topup/inet-qr-request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "th",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || data.errors?.[0]?.message || "เกิดข้อผิดพลาด" },
        { status: res.status }
      );
    }

    return NextResponse.json(data?.data ?? data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
