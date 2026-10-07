import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.CUSTOMER_CREDIT_API_URL}/topup/inet-qr-request/${encodeURIComponent(id)}/status`,
      {
        headers: { Authorization: `Bearer ${token}`, "Accept-Language": "th" },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "เกิดข้อผิดพลาด" },
        { status: res.status }
      );
    }
    return NextResponse.json(data?.data ?? data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
