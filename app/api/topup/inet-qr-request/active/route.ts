import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json(null);
    }

    const res = await fetch(`${process.env.CUSTOMER_CREDIT_API_URL}/topup/inet-qr-request/active`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "th" },
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 204) return NextResponse.json(null);
    if (!res.ok) return NextResponse.json(null);

    const data = await res.json().catch(() => null);
    return NextResponse.json(data?.data ?? data ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
